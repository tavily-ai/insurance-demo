"""Research task configurations for the 5 underwriting categories."""

from datetime import date
from typing import Dict, Any, Optional


def _location_clause(location: Optional[str]) -> str:
    return f" located in {location}" if location else ""


def get_research_tasks(company_name: str, location: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
    """
    Return the 5 research category configs, each with a query and output_schema
    for the Tavily Research API.
    """
    loc = _location_clause(location)
    today = date.today().strftime("%B %d, %Y")

    return {
        "company_info": {
            "query": (
                f"As of {today}, provide a comprehensive company profile for {company_name}{loc}. "
                f"Include: legal/registered name, headquarters address, industry classification, "
                f"NAICS code, number of employees, annual revenue (fiscal year 2025), year founded, "
                f"executive leadership team (CEO, CFO, COO, CTO, SVPs, Presidents, etc.), "
                f"and ownership structure (public/private, parent company, major shareholders)."
            ),
            "output_schema": {
                "properties": {
                    "legal_name": {"type": "string", "description": "Official registered legal name of the company"},
                    "address": {"type": "string", "description": "Headquarters address"},
                    "industry": {"type": "string", "description": "Primary industry and sub-industry"},
                    "naics_code": {"type": "string", "description": "NAICS industry classification code"},
                    "employees": {"type": "string", "description": "Approximate number of employees"},
                    "revenue": {"type": "string", "description": "Most recent annual revenue with currency (fiscal year 2025 if available)"},
                    "founded": {"type": "string", "description": "Year the company was founded"},
                    "leadership": {"type": "string", "description": "Executive leadership team: C-suite, SVPs, Presidents, and other senior executives. Do NOT include board members or board chair. Format as semicolon-separated entries like 'CEO: Name; CFO: Name; SVP Operations: Name'"},
                    "ownership": {"type": "string", "description": "Ownership structure: public/private, parent company, major shareholders"},
                    "summary": {"type": "string", "description": "Brief 2-3 sentence overview of the company"},
                    "website": {"type": "string", "description": "Company's primary website domain (e.g. 'manulife.com', 'apple.com'). Just the domain, no protocol or path."},
                },
                "required": ["legal_name", "summary", "website"],
            },
        },
        "adverse_news": {
            "query": (
                f"As of {today}, find adverse news, negative press, lawsuits, regulatory actions, fines, "
                f"scandals, controversies, and reputational issues involving {company_name}{loc} "
                f"from the past 5 years. Include the source URL for each item."
            ),
            "output_schema": {
                "properties": {
                    "adverse_items": {
                        "type": "string",
                        "description": (
                            "JSON array of adverse news items relevant to insurance underwriting risk. "
                            "Include: lawsuits, regulatory actions, fines or penalties, fraud allegations, "
                            "data breaches, product recalls, environmental violations, executive misconduct, "
                            "labor disputes, sanctions, bankruptcy filings, and significant reputational events. "
                            "Each item should be a JSON object with keys: "
                            "headline (string, concise factual title), "
                            "summary (string, 2-3 sentences explaining what happened, parties involved, and outcome or current status), "
                            "urls (array of strings, direct URLs to primary source articles). "
                            "Return '[]' if no material adverse news found."
                        ),
                    },
                },
                "required": ["adverse_items"],
            },
        },
        "risk_assessment": {
            "query": (
                f"As of {today}, perform a risk assessment for {company_name}{loc} for insurance underwriting purposes. "
                f"Evaluate: financial health and stability (fiscal year 2025 data), credit ratings (S&P, Moody's, Fitch if available), "
                f"operational risks, regulatory compliance history, litigation history, "
                f"environmental/social/governance (ESG) risks."
            ),
            "output_schema": {
                "properties": {
                    "financial_health": {"type": "string", "description": "Assessment of financial stability, profitability trends, debt levels"},
                    "credit_ratings": {"type": "string", "description": "Known credit ratings from S&P, Moody's, Fitch, or other agencies"},
                    "operational_risks": {"type": "string", "description": "Key operational risks: supply chain, technology, workforce, geographic concentration"},
                    "compliance_history": {"type": "string", "description": "Regulatory compliance track record, any violations or penalties"},
                    "litigation_history": {"type": "string", "description": "Notable lawsuits, legal proceedings, settlements"},
                    "esg_risks": {"type": "string", "description": "Environmental, social, and governance risk factors"},
                    "summary": {"type": "string", "description": "Executive summary of risk profile in 3-4 sentences"},
                },
                "required": ["summary"],
            },
        },
        "products_services": {
            "query": (
                f"As of {today}, describe the products, services, and business operations of {company_name}{loc}. "
                f"Include: main product lines, services offered, target market segments, "
                f"geographic markets served, competitive positioning, market share if known, "
                f"and any notable partnerships or distribution channels."
            ),
            "output_schema": {
                "properties": {
                    "products": {"type": "string", "description": "Main products and product lines with descriptions"},
                    "services": {"type": "string", "description": "Services offered with descriptions"},
                    "market_segments": {"type": "string", "description": "Target market segments and customer types"},
                    "geographic_reach": {"type": "string", "description": "Geographic markets and regions served"},
                    "competitive_positioning": {"type": "string", "description": "Market position, competitors, competitive advantages"},
                    "summary": {"type": "string", "description": "Brief overview of the company's business model and market position"},
                },
                "required": ["products", "summary"],
            },
        },
        "claims_history": {
            "query": (
                f"As of {today}, research the insurance claims history, loss records, and safety record of {company_name}{loc}. "
                f"Include: any known insurance claims or losses, workplace safety incidents (OSHA violations), "
                f"product liability claims, property damage or natural disaster losses, "
                f"workers compensation history, vehicle fleet incidents if applicable, "
                f"and overall safety/loss prevention track record."
            ),
            "output_schema": {
                "properties": {
                    "insurance_claims": {"type": "string", "description": "Known insurance claims, major losses, and claim patterns"},
                    "loss_records": {"type": "string", "description": "Property damage, business interruption, or other recorded losses"},
                    "workplace_incidents": {"type": "string", "description": "OSHA violations, workplace injuries, safety citations"},
                    "product_liability": {"type": "string", "description": "Product liability claims, recalls, or safety issues"},
                    "safety_record": {"type": "string", "description": "Overall safety track record and loss prevention measures"},
                    "summary": {"type": "string", "description": "Summary of claims/loss history and safety profile"},
                },
                "required": ["summary"],
            },
        },
    }


def get_linkedin_task(
    company_name: str,
    leader_names: list[str],
    location: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build a LinkedIn profile lookup task using the exact leader names
    already discovered by the company_info task.
    """
    loc = _location_clause(location)
    names_list = ", ".join(leader_names)

    return {
        "query": (
            f"Find the LinkedIn profile URLs for these specific executives at {company_name}{loc}: {names_list}. "
            f"For each person, find their actual LinkedIn profile page URL (linkedin.com/in/...). "
            f"Only include verified LinkedIn URLs that you find through search."
        ),
        "output_schema": {
            "properties": {
                "linkedin_profiles": {
                    "type": "string",
                    "description": (
                        "JSON object mapping each senior executive's full name to their LinkedIn profile URL. "
                        f"The executives to search for are: {names_list}. "
                        "Example: {\"Michael Rousseau\": \"https://www.linkedin.com/in/michael-rousseau-abc123\", "
                        "\"John DiBert\": \"https://www.linkedin.com/in/john-dibert-xyz789\"}. "
                        "Only include URLs you actually found. Omit anyone whose profile was not found."
                    ),
                },
            },
            "required": ["linkedin_profiles"],
        },
    }
