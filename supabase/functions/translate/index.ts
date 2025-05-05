
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text to translate is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // For now, just simulate translation
    // In production, this would integrate with a real translation API
    const simulateTranslation = (text: string, target: string): string => {
      // This is just a mock function
      if (target === 'ja') {
        return `これは「${text}」の日本語翻訳です。実際の翻訳APIを使用してください。`;
      } else {
        return `이것은 "${text}"의 한국어 번역입니다. 실제 번역 API를 사용해주세요.`;
      }
    }

    const translatedText = simulateTranslation(text, targetLanguage);

    return new Response(
      JSON.stringify({ 
        translatedText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
