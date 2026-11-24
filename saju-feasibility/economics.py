from dataclasses import dataclass
from decimal import ROUND_CEILING, Decimal


@dataclass(frozen=True)
class Scenario:
    name: str
    price: int
    conversion: Decimal
    refund: Decimal
    fee: Decimal
    free_ai_cost: int
    paid_ai_cost: int
    acquisition_cost: int

    @property
    def contribution_per_purchase(self) -> Decimal:
        return self.price * (1 - self.refund) * (1 - self.fee) - self.paid_ai_cost

    @property
    def cost_per_visitor(self) -> int:
        return self.free_ai_cost + self.acquisition_cost

    @property
    def contribution_per_visitor(self) -> Decimal:
        return self.conversion * self.contribution_per_purchase - self.cost_per_visitor

    def break_even_visitors(self, monthly_fixed_cost: int) -> int | None:
        contribution = self.contribution_per_visitor
        if contribution <= 0:
            return None
        return int((monthly_fixed_cost / contribution).to_integral_value(rounding=ROUND_CEILING))

    @property
    def break_even_conversion(self) -> Decimal | None:
        contribution = self.contribution_per_purchase
        if contribution <= 0:
            return None
        return self.cost_per_visitor / contribution


MONTHLY_FIXED_COST = 500_000
SCENARIOS = (
    Scenario("보수", 7900, Decimal("0.02"), Decimal("0.10"), Decimal("0.05"), 50, 300, 150),
    Scenario("기준", 4900, Decimal("0.05"), Decimal("0.05"), Decimal("0.04"), 30, 200, 100),
    Scenario("낙관", 6900, Decimal("0.08"), Decimal("0.03"), Decimal("0.04"), 30, 300, 80),
)


def main() -> None:
    print(f"월 고정비 {MONTHLY_FIXED_COST:,}원")
    for scenario in SCENARIOS:
        visitors = scenario.break_even_visitors(MONTHLY_FIXED_COST)
        conversion = scenario.break_even_conversion
        visitor_text = f"{visitors:,}명" if visitors is not None else "없음"
        conversion_text = f"{conversion:.4%}" if conversion is not None else "없음"
        print(
            f"{scenario.name} | 방문자당 기여이익 {scenario.contribution_per_visitor:,.4f}원"
            f" | 월 손익분기 {visitor_text} | 기여이익 0인 결제율 {conversion_text}"
        )


if __name__ == "__main__":
    main()
