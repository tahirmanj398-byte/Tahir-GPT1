import { create } from 'zustand';
import { GoogleGenAI } from '@google/genai';
import { localDb, safeSetItem } from '../utils/localDb';
import { autoRetry } from '../utils/autoRetry';

interface GenState {
  // Website
  websitePrompt: string;
  websiteCode: string;
  websiteUrl: string;
  isWebsiteGenerating: boolean;
  isWebsiteDeploying: boolean;
  websiteError: string;
  setWebsiteState: (state: Partial<GenState>) => void;
  generateWebsite: (prompt: string, existingCode: string, fileContext?: { data: string, mimeType: string }) => Promise<void>;
  deployWebsite: (htmlCode: string, websiteId?: number) => Promise<void>;

  // Image
  imagePrompt: string;
  imageUrl: string;
  isImageGenerating: boolean;
  imageError: string;
  setImageState: (state: Partial<GenState>) => void;
  generateImage: (prompt: string, fileContext?: { data: string, mimeType: string }) => Promise<void>;
  editImage: (prompt: string, existingImageUrl: string) => Promise<void>;
}

export const useGenStore = create<GenState>((set, get) => ({
  websitePrompt: '',
  websiteCode: '',
  websiteUrl: '',
  isWebsiteGenerating: false,
  isWebsiteDeploying: false,
  websiteError: '',
  setWebsiteState: (state) => set((prev) => ({ ...prev, ...state })),

  deployWebsite: async (htmlCode: string, websiteId?: number) => {
    set({ isWebsiteDeploying: true });
    try {
      let vercelToken = (import.meta as any).env.VITE_VERCEL_TOKEN || localStorage.getItem('vercel_token');
      
      if (!vercelToken) {
        vercelToken = window.prompt("To deploy this website live, please enter your Vercel Token (Get it from vercel.com/account/tokens).\n\nIf you just want to preview the code, click Cancel.");
        if (vercelToken) {
          safeSetItem('vercel_token', vercelToken);
        } else {
          return; // User cancelled, skip deployment
        }
      }

      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `tahir-gpt-${Date.now()}`,
          files: [
            {
              file: 'index.html',
              data: htmlCode,
            },
          ],
          projectSettings: {
            framework: null,
          },
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('vercel_token'); // Clear invalid token
          throw new Error('Invalid Vercel Token. Please try again.');
        }
        throw new Error(data?.error?.message || data?.error || 'Deployment failed');
      }
      const url = `https://${data.url}`;
      set({ websiteUrl: url });
      
      if (websiteId) {
        localDb.updateWebsite(websiteId, { url });
      }
    } catch (err: any) {
      console.error('Deployment error:', err);
      alert(err.message);
    } finally {
      set({ isWebsiteDeploying: false });
    }
  },

  generateWebsite: async (prompt: string, existingCode: string, fileContext?: { data: string, mimeType: string }) => {
    if (!prompt.trim() && !fileContext && get().isWebsiteGenerating) return;

    set({ isWebsiteGenerating: true, websiteError: '', websiteCode: '', websiteUrl: '' });

    const callGemini = async (retry = 0): Promise<string> => {
      try {
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not configured. If deploying, set VITE_GEMINI_API_KEY.');
        const ai = new GoogleGenAI({ apiKey });
        
        let aiPrompt: any = "Generate a high-level, professional, fully functional single-file HTML website with Tailwind CSS and JS based on: " + prompt + ". Return ONLY the raw HTML code. No markdown, no talk. Ensure it is responsive and modern.";
        
        if (existingCode) {
          aiPrompt = "Modify the following HTML code based on this new request: '" + prompt + "'.\n\nExisting Code:\n```html\n" + existingCode + "\n```\n\nReturn ONLY the updated raw HTML code. No markdown, no talk.";
        }

        const contents: any = { parts: [] };
        if (fileContext) {
          contents.parts.push({ inlineData: { data: fileContext.data, mimeType: fileContext.mimeType } });
          if (fileContext.mimeType.startsWith('image/')) {
            contents.parts.push({ text: `Use this image as a reference for the design/content of the website. ${aiPrompt}` });
          } else {
            contents.parts.push({ text: `Use the content of this file as the requirements or content for the website. ${aiPrompt}` });
          }
        } else {
          contents.parts.push({ text: aiPrompt });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: contents,
          config: {
            systemInstruction: `You are Tahir GPT's expert web developer. You generate enterprise-grade, fully functional, single-file HTML/CSS/JS solutions. 
            - Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
            - Include all necessary icons (Lucide/FontAwesome) and fonts.
            - Ensure it is responsive, modern, and has interactive elements (JS).
            - Do NOT just give a snippet; give a complete, deployable product.
            - Always mention "Tahir GPT" as the creator in the footer.`,
            temperature: 0.7,
          }
        });
        return response.text || '';
      } catch (err: any) {
        if (retry < 2) {
          await new Promise(r => setTimeout(r, 500 * (retry + 1)));
          return callGemini(retry + 1);
        }
        throw err;
      }
    };

    try {
      let aiResponse = await callGemini();

      // Clean up markdown if AI still includes it
      const htmlMatch = aiResponse.match(/```html([\s\S]*?)```/) || aiResponse.match(/```([\s\S]*?)```/);
      if (htmlMatch) {
        aiResponse = htmlMatch[1].trim();
      } else {
        aiResponse = aiResponse.replace(/```html/gi, '').replace(/```/g, '').trim();
      }

      set({ websiteCode: aiResponse });
      
      // Save to history
      const savedWebsite = localDb.saveWebsite({ prompt, code: aiResponse });
      
      // Automatically trigger deployment
      await get().deployWebsite(aiResponse, savedWebsite.id);
    } catch (err: any) {
      set({ websiteError: err.message });
    } finally {
      set({ isWebsiteGenerating: false });
    }
  },

  imagePrompt: '',
  imageUrl: '',
  isImageGenerating: false,
  imageError: '',
  setImageState: (state) => set((prev) => ({ ...prev, ...state })),

  generateImage: async (prompt: string, fileContext?: { data: string, mimeType: string }) => {
    if (!prompt.trim() && !fileContext && get().isImageGenerating) return;

    set({ isImageGenerating: true, imageError: '', imageUrl: '' });

    try {
      let imageUrl = '';
      let textResponse = '';
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        
        let enhancedPrompt = prompt || "Generate a beautiful image based on the provided context.";
        if (prompt && prompt.split(' ').length < 3) {
          enhancedPrompt = `${prompt}, high quality, detailed, professional`;
        }

        const contents: any = { parts: [] };
        if (fileContext) {
          contents.parts.push({ inlineData: { data: fileContext.data, mimeType: fileContext.mimeType } });
          if (fileContext.mimeType.startsWith('image/')) {
            contents.parts.push({ text: `Use this image as a reference. ${enhancedPrompt}` });
          } else {
            contents.parts.push({ text: `Use the content of this file as context for the image generation. ${enhancedPrompt}` });
          }
        } else {
          contents.parts.push({ text: enhancedPrompt });
        }

        const response = await autoRetry(() => ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: contents,
          config: {
            imageConfig: { aspectRatio: '1:1' }
          }
        }));

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      } else {
        throw new Error('No AI API keys configured. Please set VITE_GEMINI_API_KEY.');
      }

      if (!imageUrl) {
        throw new Error(textResponse || 'Failed to generate image. No image data returned.');
      }

      localDb.saveImage({ prompt, image_url: imageUrl });
      set({ imagePrompt: '', imageUrl });
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('400') || errorMsg.toLowerCase().includes('safety') || errorMsg.toLowerCase().includes('blocked')) {
        set({ imageError: 'Image generation failed. The prompt might be blocked by safety filters. Please try a different description.' });
      } else {
        set({ imageError: `Failed to generate image: ${errorMsg}. Please try again.` });
      }
    } finally {
      set({ isImageGenerating: false });
    }
  },

  editImage: async (prompt: string, existingImageUrl: string) => {
    if (!prompt.trim() || !existingImageUrl || get().isImageGenerating) return;

    set({ isImageGenerating: true, imageError: '', imageUrl: '' });

    try {
      let imageUrl = '';
      let textResponse = '';
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        
        // Extract base64 data and mime type from data URL
        const match = existingImageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!match) throw new Error('Invalid existing image format');
        
        const mimeType = match[1];
        const base64Data = match[2];

        const response = await autoRetry(() => ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { 
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: `Modify this image based on this request: ${prompt}. Maintain the style and context of the original image.` }
            ] 
          },
          config: {
            imageConfig: { aspectRatio: '1:1' }
          }
        }));

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      } else {
        throw new Error('No AI API keys configured. Please set VITE_GEMINI_API_KEY.');
      }

      if (!imageUrl) {
        throw new Error(textResponse || 'Failed to edit image. No image data returned.');
      }

      localDb.saveImage({ prompt: `Edit: ${prompt}`, image_url: imageUrl });
      set({ imagePrompt: '', imageUrl });
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      set({ imageError: `Failed to edit image: ${errorMsg}. Please try again.` });
    } finally {
      set({ isImageGenerating: false });
    }
  }
}));
