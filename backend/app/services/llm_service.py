import google.generativeai as genai
from typing import List, Dict, Any, Optional
import json
import re
from ..config import settings


class LLMService:
    """Service for interacting with Google Gemini LLM"""
    
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            raise Exception("GOOGLE_API_KEY not set")
            
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        models_to_try = [
            "models/gemini-2.5-flash",
            "models/gemini-flash-latest",
            "models/gemini-2.5-pro",
            "models/gemini-pro-latest",
        ]
        
        self.model = None
        last_error = None
        
        for model_name in models_to_try:
            try:
                self.model = genai.GenerativeModel(model_name)
                test_response = self.model.generate_content("Hi")
                if test_response.text:
                    print(f"✅ Successfully using Gemini model: {model_name}")
                    break
            except Exception as e:
                last_error = str(e)
                print(f"⚠️ Model {model_name} failed: {str(e)[:100]}")
                continue
        
        if not self.model:
            raise Exception(f"No working Gemini model found. Last error: {last_error}")
        
    async def generate(
        self,
        prompt: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text using Gemini"""
        try:
            full_prompt = prompt
            if context:
                full_prompt = f"Context:\n{context}\n\n{prompt}"
            
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )
            
            if not response or not response.text:
                raise Exception("Empty response from Gemini")
            
            return response.text
            
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")
    
    def _clean_json_string(self, text: str) -> str:
        """Clean and extract JSON from LLM response"""
        text = text.strip()
        
        # Remove markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            parts = text.split("```")
            if len(parts) >= 3:
                text = parts[1]
            elif len(parts) == 2:
                text = parts[1]
        
        text = text.strip()
        
        # Try to find JSON object
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group()
        
        return text
    
    def _parse_json_safely(self, text: str) -> Dict[str, Any]:
        """Try multiple methods to parse JSON"""
        # Method 1: Direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Method 2: Fix common issues
        try:
            # Replace single quotes with double quotes
            fixed = text.replace("'", '"')
            return json.loads(fixed)
        except:
            pass
        
        # Method 3: Extract individual fields with regex
        try:
            result = {}
            
            # Extract summary
            summary_match = re.search(r'"summary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"', text, re.DOTALL)
            if summary_match:
                result["summary"] = summary_match.group(1).replace('\\"', '"').replace('\\n', ' ')
            
            # Extract arrays
            for field in ["key_insights", "strengths", "weaknesses", "opportunities", "risks"]:
                array_match = re.search(rf'"{field}"\s*:\s*\[(.*?)\]', text, re.DOTALL)
                if array_match:
                    array_content = array_match.group(1)
                    # Extract quoted strings
                    items = re.findall(r'"([^"]*(?:\\.[^"]*)*)"', array_content)
                    result[field] = [item.replace('\\"', '"').replace('\\n', ' ') for item in items]
            
            if result:
                return result
        except Exception as e:
            print(f"⚠️ Regex extraction failed: {str(e)}")
        
        # Method 4: Fallback - return default structure
        return {
            "summary": "Analysis completed but response format was invalid",
            "key_insights": ["Unable to parse structured insights"],
            "strengths": ["See raw analysis for details"],
            "weaknesses": [],
            "opportunities": [],
            "risks": []
        }
    
    async def generate_structured(
        self,
        prompt: str,
        context: Optional[str] = None,
        schema: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate structured JSON output with robust parsing"""
        try:
            structured_prompt = f"""{prompt}

CRITICAL INSTRUCTIONS:
1. Respond with ONLY valid JSON
2. Use double quotes for strings
3. Escape any quotes inside strings with backslash
4. Do not use line breaks inside string values
5. Do not include markdown code blocks
6. Example format:
{{"summary": "Brief text here", "key_insights": ["Item 1", "Item 2"]}}
"""
            if schema:
                structured_prompt += f"\n\nRequired JSON structure:\n{json.dumps(schema, indent=2)}\n"
            
            response_text = await self.generate(
                structured_prompt,
                context=context,
                temperature=0.3
            )
            
            print(f"📝 Raw LLM response (first 200 chars): {response_text[:200]}")
            
            # Clean the response
            cleaned = self._clean_json_string(response_text)
            
            print(f"🧹 Cleaned response (first 200 chars): {cleaned[:200]}")
            
            # Parse with fallback methods
            result = self._parse_json_safely(cleaned)
            
            print(f"✅ Parsed successfully: {list(result.keys())}")
            
            return result
            
        except Exception as e:
            print(f"❌ Structured generation error: {str(e)}")
            print(f"📄 Response was: {response_text[:500] if 'response_text' in locals() else 'N/A'}")
            raise Exception(f"Structured generation failed: {str(e)}")
    
    async def analyze_with_context(
        self,
        query: str,
        context_chunks: List[str],
        analysis_type: str = "general"
    ) -> Dict[str, Any]:
        """Analyze with RAG context"""
        
        # Check if context is empty
        if not context_chunks or sum(len(c) for c in context_chunks) < 50:
            return {
                "summary": "Insufficient information in documents to answer this question.",
                "key_insights": ["No relevant information found"],
                "strengths": [],
                "weaknesses": [],
                "opportunities": [],
                "risks": []
            }
        
        context = "\n\n---DOCUMENT CHUNK---\n\n".join(context_chunks)
        
        prompt = f"""You are an expert startup analyst. Your task is to analyze ONLY based on the provided context.

    CRITICAL RULES:
    1. Use ONLY information from the context below
    2. If the context doesn't contain information to answer the question, say "Information not available"
    3. DO NOT invent, assume, or hallucinate any facts
    4. DO NOT use general knowledge about startups
    5. If you're unsure, say so explicitly

    Analysis Type: {analysis_type}
    Question: {query}

    Respond in valid JSON:
    {{
    "summary": "2-3 sentences based ONLY on context",
    "key_insights": ["insight from context", "another from context"],
    "strengths": ["strength mentioned in context"],
    "weaknesses": ["weakness from context"],
    "opportunities": ["opportunity from context"],
    "risks": ["risk mentioned in context"]
    }}

    If the context is empty or doesn't address the question, return:
    {{
    "summary": "Information not available in provided documents",
    "key_insights": ["No relevant information found"],
    "strengths": [],
    "weaknesses": [],
    "opportunities": [],
    "risks": []
    }}"""

        return await self.generate_structured(
            prompt=prompt,
            context=context
        )


# Singleton instance
llm_service = LLMService()