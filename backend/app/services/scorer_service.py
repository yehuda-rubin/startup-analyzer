from sqlalchemy.orm import Session
from typing import Dict, List, Any
from ..models.models import Score, Startup
from .llm_service import llm_service
from .rag_service import rag_service
from .search_service import search_service


class ScorerService:
    """Service for scoring startups"""
    
    # Scoring weights (must sum to 1.0)
    WEIGHTS = {
        "team_score": 0.25,
        "product_score": 0.20,
        "market_score": 0.20,
        "traction_score": 0.15,
        "financials_score": 0.10,
        "innovation_score": 0.10,
    }

    def _format_score(self, score: float) -> str:
        """Format score with max 2 decimals, removing trailing zeros"""
        if score is None:
            return "0"
        rounded = round(score, 2)
        if rounded == int(rounded):
            return str(int(rounded))
        formatted = f"{rounded:.2f}"
        return formatted.rstrip('0').rstrip('.')
    
    async def score_startup(
        self,
        db: Session,
        startup_id: int
    ) -> Score:
        """Calculate comprehensive score for a startup"""
        
        print(f"\n{'='*60}")
        print(f"📊 SCORING START: Startup {startup_id}")
        print(f"{'='*60}")
        
        # Get startup
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise ValueError("Startup not found")
        
        print(f"🏢 Startup: {startup.name}")
        
        # ✅ Step 1: Extract founder names
        founder_names = await self._extract_founder_names(startup_id)
        
        # ✅ Step 2: Get web validation (with founder names)
        web_validation = await self._get_web_validation(startup, founder_names)
        
        # Score each category
        scores = {}
        
        for category, weight in self.WEIGHTS.items():
            print(f"\n--- Scoring {category} (weight: {weight*100}%) ---")
            
            score = await self._score_category(startup_id, category, web_validation)
            scores[category] = score
            
            print(f"✅ {category}: {self._format_score(score)}/100")
        
        print(f"\n{'='*60}")
        print(f"📈 SCORES BREAKDOWN:")
        for cat, score in scores.items():
            print(f"   {cat}: {self._format_score(score)}/100")
        print(f"{'='*60}")
        
        # Calculate overall score
        overall = sum(scores[cat] * self.WEIGHTS[cat] for cat in self.WEIGHTS.keys())
        
        print(f"\n🎯 Overall Score: {self._format_score(overall)}/100")
        
        # Determine confidence
        confidence = self._calculate_confidence(scores)
        
        # Generate reasoning (with web validation)
        reasoning = await self._generate_reasoning(startup_id, scores, overall, web_validation)
        
        # Create score record
        score_record = Score(
            startup_id=startup_id,
            overall_score=overall,
            team_score=scores.get("team_score", 0),
            product_score=scores.get("product_score", 0),
            market_score=scores.get("market_score", 0),
            traction_score=scores.get("traction_score", 0),
            financials_score=scores.get("financials_score", 0),
            innovation_score=scores.get("innovation_score", 0),
            score_breakdown=scores,
            reasoning=reasoning,
            scoring_criteria=self.WEIGHTS,
            confidence_level=confidence
        )
        
        db.add(score_record)
        db.commit()
        db.refresh(score_record)
        
        print(f"\n{'='*60}")
        print(f"✅ SCORING COMPLETE (with web validation)")
        print(f"{'='*60}\n")
        
        return score_record
    
    # ✅ NEW METHOD - חילוץ שמות מייסדים
    async def _extract_founder_names(self, startup_id: int) -> List[str]:
        """Extract founder names from documents using LLM"""
        try:
            print(f"\n👥 Extracting founder names...")
            
            # Get context about team/founders
            context = await rag_service.get_context(
                startup_id, 
                "Who are the founders, CEO, CTO, and key team members? List their full names.",
                max_chunks=3
            )
            
            if not context or sum(len(c) for c in context) < 50:
                print(f"⚠️ No team information found in documents")
                return []
            
            context_text = "\n\n".join(context)
            
            # Ask LLM to extract names
            prompt = f"""Extract the names of founders and key executives from this text.

CONTEXT:
{context_text}

RULES:
1. Return ONLY full names (first + last name)
2. Include: Founders, CEO, CTO, key executives
3. Do NOT include: advisors, investors, board members
4. If no names found, return empty list

Respond with ONLY valid JSON:
{{"founder_names": ["Name 1", "Name 2"]}}

Example:
{{"founder_names": ["Danny Cohen", "Sara Levi"]}}"""

            result = await llm_service.generate_structured(
                prompt=prompt,
                context=None
            )
            
            names = result.get("founder_names", [])
            
            if names:
                print(f"✅ Found {len(names)} founder(s): {', '.join(names)}")
            else:
                print(f"⚠️ No founder names extracted")
            
            return names
            
        except Exception as e:
            print(f"⚠️ Founder extraction failed: {e}")
            return []
    
    # ✅ UPDATED METHOD - מקבל founder_names
    async def _get_web_validation(self, startup: Startup, founder_names: List[str] = None) -> str:
        """Get web search validation for startup claims"""
        try:
            print(f"\n🌐 Fetching web validation...")
            
            validation = await search_service.validate_startup_claims(
                startup_name=startup.name,
                industry=startup.industry if hasattr(startup, 'industry') else None,
                founder_names=founder_names  # ✅ מעביר שמות מייסדים
            )
            
            print(f"✅ Web validation retrieved ({len(validation)} chars)")
            return validation
            
        except Exception as e:
            print(f"⚠️ Web validation failed (continuing with docs only): {e}")
            return ""
    
    async def _score_category(
        self,
        startup_id: int,
        category: str,
        web_validation: str = ""
    ) -> float:
        """Score a specific category"""
        
        # Get context
        query = self._get_category_query(category)
        print(f"   Query: {query[:100]}...")
        
        context = await rag_service.get_context(startup_id, query, max_chunks=5)
        
        if not context or sum(len(c) for c in context) < 50:
            print(f"   ⚠️ WARNING: Insufficient context for {category}")
            return 50.0
        
        print(f"   📚 Context: {sum(len(c) for c in context)} chars")
        
        # Build scoring prompt (with web validation)
        prompt = self._build_scoring_prompt(category, context, web_validation)
        
        # Get LLM score
        try:
            result = await llm_service.generate_structured(
                prompt=prompt,
                context=None
            )
            
            print(f"   📝 LLM Response: {result}")
            
            # Extract score with validation
            score = float(result.get("score", 50))
            
            # Validate range
            if score < 0 or score > 100:
                print(f"   ⚠️ Score out of range: {score}, clamping to 0-100")
                score = max(0, min(100, score))
            
            return score
            
        except Exception as e:
            print(f"   ❌ Scoring failed for {category}: {str(e)}")
            return 50.0
    
    def _get_category_query(self, category: str) -> str:
        """Get search query for each category"""
        
        queries = {
            "team_score": "What is the team's background, experience, expertise, and track record? Who are the founders and key team members?",
            "product_score": "What is the product innovation, technical feasibility, product-market fit, and differentiation from competitors?",
            "market_score": "What is the market size (TAM/SAM/SOM), growth potential, market timing, and market accessibility?",
            "traction_score": "What is the revenue, user growth, customer acquisition, partnerships, and key milestones achieved?",
            "financials_score": "What are the unit economics (LTV/CAC), burn rate, runway, path to profitability, and financial projections?",
            "innovation_score": "What is the technology innovation, intellectual property (patents), business model uniqueness, and competitive moat?",
        }
        
        return queries.get(category, "Analyze this startup")
    
    def _build_scoring_prompt(self, category: str, context: List[str], web_validation: str = "") -> str:
        """Build prompt for scoring a category"""
        
        context_text = "\n\n---\n\n".join(context)
        
        # Category-specific criteria
        criteria_map = {
            "team_score": [
                "Founder experience (5+ years in industry)",
                "Domain expertise and track record",
                "Previous successful exits or achievements",
                "Team completeness (CTO, CEO, CPO roles covered)"
            ],
            "product_score": [
                "Innovation level and uniqueness",
                "Technical feasibility and execution",
                "Product-market fit evidence",
                "Differentiation from competitors"
            ],
            "market_score": [
                "⚠️ CRITICAL: Compare claimed TAM/SAM/SOM against web validation data",
                "If claimed market > 2x validated market → Significant penalty (-20 to -40 points)",
                "If claimed market > 5x validated market → Severe penalty (-40 to -60 points)",
                "Market growth rate validation (> 10% annually)",
                "Market timing and trends",
                "Market accessibility and barriers to entry"
            ],
            "traction_score": [
                "Revenue (MRR/ARR)",
                "User/customer growth rate",
                "Strategic partnerships",
                "Key milestones and achievements"
            ],
            "financials_score": [
                "Unit economics (LTV/CAC ratio > 3)",
                "Burn rate and runway (> 12 months)",
                "Path to profitability",
                "Financial sustainability"
            ],
            "innovation_score": [
                "Technology innovation and IP (patents, proprietary tech)",
                "Business model innovation",
                "Competitive moat and defensibility",
                "R&D capabilities"
            ]
        }
        
        criteria = criteria_map.get(category, [])
        criteria_text = "\n".join(f"- {c}" for c in criteria)
        
        # ✅ SPECIAL HANDLING FOR MARKET SCORE
        if category == "market_score":
            return f"""You are an expert startup investor performing CRITICAL MARKET VALIDATION.

    SOURCE 1 (STARTUP CLAIMS - May be inflated):
    {context_text}

    SOURCE 2 (WEB VALIDATION - Actual market data):
    {web_validation if web_validation else "No web validation available"}

    YOUR MISSION: FACT-CHECK THE MARKET SIZE CLAIMS

    EVALUATION CRITERIA:
    {criteria_text}

    ⚠️ CRITICAL MARKET VALIDATION RULES:
    1. Extract claimed TAM/SAM/SOM from SOURCE 1
    2. Extract actual market size from SOURCE 2 (look for "market size", "TAM", "industry value")
    3. COMPARE and PENALIZE inflated claims:
    
    IF claimed market is 2-5x larger than validated:
    → Base score: 60-70 (inflated but not absurd)
    → Flag: "Market size appears inflated"
    
    IF claimed market is 5-10x larger than validated:
    → Base score: 40-60 (severely inflated)
    → Flag: "Market size significantly overstated"
    
    IF claimed market is 10x+ larger than validated:
    → Base score: 20-40 (unrealistic)
    → Flag: "Market size grossly exaggerated"

    4. If web validation is missing or unclear, score conservatively (60-70)
    5. If startup provides NO market data, score 50

    SCORING EXAMPLES:

    Example 1 - Realistic:
    Deck: "Risk management software TAM: $5B"
    Web: "Risk management software market: $3.68B in 2024"
    → Score: 75 (close to reality, 1.4x multiple is acceptable)

    Example 2 - Inflated:
    Deck: "E-commerce fraud prevention TAM: $25B"
    Web: "Financial risk management software: $3.68B in 2024"
    → Score: 55 (7x inflation, significantly overstated)

    Example 3 - Severely Inflated:
    Deck: "AI productivity tools TAM: $500B"
    Web: "Productivity software market: $50B in 2024"
    → Score: 35 (10x inflation, grossly exaggerated)

    JUSTIFICATION MUST INCLUDE:
    - Claimed market size from deck
    - Actual market size from web
    - Calculation showing the multiple (e.g., "claimed 7x larger")
    - Clear statement if market is inflated

    Respond with valid JSON:
    {{
    "score": <number 0-100>,
    "justification": "The deck claims a TAM of $[X]B, but web validation shows the actual [specific market segment] market is $[Y]B in 2024 (claimed [Z]x larger). [VERDICT]",
    "key_factors": ["Claimed market: $XB", "Actual market: $YB", "Inflation multiple: Zx"]
    }}"""
        
        # STANDARD PROMPT FOR OTHER CATEGORIES
        return f"""You are an expert startup investor. Score this startup on the {category.replace('_', ' ').title()} dimension.

    SOURCE 1 (INTERNAL DOCUMENTS - Primary Truth):
    {context_text}

    SOURCE 2 (WEB VALIDATION - Reality Check):
    {web_validation if web_validation else "No web validation available"}

    EVALUATION CRITERIA:
    {criteria_text}

    CRITICAL SCORING RULES:
    1. Base score on SOURCE 1 (documents)
    2. Use SOURCE 2 to VALIDATE and ADJUST:
    - If web shows market is smaller than claimed → REDUCE market_score
    - If web reveals hidden strong competitors → REDUCE product_score/market_score
    - If web shows negative reviews/red flags → REDUCE team_score/traction_score
    - If web validates strong claims → MAINTAIN or INCREASE score
    3. PENALIZE discrepancies between deck and reality

    SCORING SCALE:
    - 90-100: Exceptional - Best in class, unicorn potential
    - 80-89: Excellent - Strong fundamentals, top 10%
    - 70-79: Good - Above average, solid investment
    - 60-69: Adequate - Average, meets expectations
    - 50-59: Below Average - Significant gaps or unvalidated claims
    - 0-49: Weak - Critical deficiencies or major red flags

    IMPORTANT:
    - Be objective but not overly conservative
    - 50 is BELOW AVERAGE, not neutral
    - Give credit for concrete achievements (patents, metrics, traction)
    - REDUCE score if web validation contradicts deck claims

    Respond with valid JSON:
    {{
    "score": <number 0-100>,
    "justification": "2-3 sentence explanation citing specific evidence from context AND web validation",
    "key_factors": ["factor 1", "factor 2", "factor 3"]
    }}

    Example with web validation impact:
    {{
    "score": 65,
    "justification": "The deck claims a $25B TAM, but web validation shows the actual risk management software market is only $3.68B in 2024. The team has strong technical credentials (8200 alumni CEO), but the market opportunity appears significantly overstated.",
    "key_factors": ["Market size overstated", "Strong technical team", "Limited market validation"]
    }}"""
    
    def _calculate_confidence(self, scores: Dict[str, float]) -> str:
        """Calculate confidence level based on score variance"""
        
        score_values = list(scores.values())
        avg_score = sum(score_values) / len(score_values)
        variance = sum((s - avg_score) ** 2 for s in score_values) / len(score_values)
        std_dev = variance ** 0.5
        
        if std_dev < 10:
            return "High"
        elif std_dev < 20:
            return "Medium"
        else:
            return "Low"
    
    async def _generate_reasoning(
        self,
        startup_id: int,
        scores: Dict[str, float],
        overall: float,
        web_validation: str = ""
    ) -> str:
        """Generate detailed reasoning for the score using LLM"""
        
        print(f"\n--- Generating Overall Reasoning ---")
        
        # Get comprehensive context
        context_query = "Provide a comprehensive overview of the startup including: company name, product, technology, team, traction metrics, market opportunity, and key achievements."
        context = await rag_service.get_context(startup_id, context_query, max_chunks=8)
        
        if not context:
            return self._generate_simple_reasoning(scores, overall)
        
        context_text = "\n\n".join(context)
        
        prompt = f"""You are an expert investment analyst writing a detailed investment memo.

SCORES:
Overall: {self._format_score(overall)}/100
Team: {self._format_score(scores['team_score'])} | Product: {self._format_score(scores['product_score'])} | Market: {self._format_score(scores['market_score'])}
Traction: {self._format_score(scores['traction_score'])} | Financials: {self._format_score(scores['financials_score'])} | Innovation: {self._format_score(scores['innovation_score'])}

SOURCE 1 (STARTUP DOCUMENTS):
{context_text}

SOURCE 2 (WEB VALIDATION):
{web_validation if web_validation else "No web validation available"}

===== ROLE & OBJECTIVE =====
Act as a Senior VC Analyst. Review the deck AND web validation to generate a concise investment memo.

===== CRITICAL RULES =====
1. **Source Truth:** Use documents as primary, web as reality check
2. **Flag Discrepancies:** Explicitly mention when web contradicts deck
3. **Output:** Provide the specific structure below

===== OUTPUT STRUCTURE =====

### 🎯 Executive Summary
* **Verdict:** "[Company Name] scored **{self._format_score(overall)}/100**. A [Solid/Risky/High-Potential] opportunity."
* **The Hook:** One sentence explaining the core value proposition.

### 🚀 Key Strengths
* Choose the top 3 categories from [Product, Market, Traction, Innovation, Financials, Team].
* Format: "* **[Category Name] ([Score]):** [One sentence evidence with numbers]."

### ⚠️ Critical Risks
* Choose the lowest scoring category.
* Format: "* **[Category Name] ([Score]):** [Specific concern]."
* **Web Validation Flags:** [Mention ANY discrepancies between deck and web research]
* **Financial Reality:** [One sentence on projections/burn rate].

### 💡 Final Recommendation
* One decisive sentence on the investment decision considering both sources.

---
### 📊 DATA_FOR_UI (Strictly output this list for parsing)
* Team: {self._format_score(scores['team_score'])}
* Product: {self._format_score(scores['product_score'])}
* Market: {self._format_score(scores['market_score'])}
* Traction: {self._format_score(scores['traction_score'])}
* Financials: {self._format_score(scores['financials_score'])}
* Innovation: {self._format_score(scores['innovation_score'])}
* Overall: {self._format_score(overall)}"""
         
        try:
            reasoning = await llm_service.generate(
                prompt=prompt,
                context=None,
                temperature=0.7,
                max_tokens=11000
            )
            
            reasoning = reasoning.strip()
            
            if "```" in reasoning:
                parts = reasoning.split("```")
                reasoning = parts[1] if len(parts) >= 3 else parts[0]
                reasoning = reasoning.strip()
            
            print(f"✅ Generated reasoning ({len(reasoning)} chars)")
            
            return reasoning
            
        except Exception as e:
            print(f"❌ Reasoning generation failed: {str(e)}")
            return self._generate_simple_reasoning(scores, overall)
    
    def _generate_simple_reasoning(self, scores: Dict[str, float], overall: float) -> str:
        """Fallback simple reasoning when LLM fails"""
        
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_categories = sorted_scores[:3]
        bottom_category = sorted_scores[-1]
        
        reasoning = f"""### 🎯 Executive Summary
The startup received an overall score of **{self._format_score(overall)}/100**.

### 🚀 Key Strengths
"""
        
        for cat, score in top_categories:
            cat_name = cat.replace('_', ' ').title().replace(' Score', '')
            reasoning += f"* **{cat_name} ({self._format_score(score)}):** Strong performance in this area.\n"

        reasoning += f"""
### ⚠️ Critical Risks
* **{bottom_category[0].replace('_', ' ').title().replace(' Score', '')} ({self._format_score(bottom_category[1])}):** Needs improvement.

### 💡 Final Recommendation
Consider this investment opportunity with careful attention to the identified weaknesses.

---
### 📊 DATA_FOR_UI
"""
        
        for cat, score in scores.items():
            cat_name = cat.replace('_score', '').title()
            reasoning += f"* {cat_name}: {self._format_score(score)}\n"

        reasoning += f"* Overall: {self._format_score(overall)}\n"
        
        return reasoning


# Singleton
scorer_service = ScorerService()