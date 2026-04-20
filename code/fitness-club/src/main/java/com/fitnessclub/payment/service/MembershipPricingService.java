package com.fitnessclub.payment.service;

import com.fitnessclub.membership.entity.AccessLevel;
import com.fitnessclub.membership.entity.MembershipType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class MembershipPricingService {

    // Base prices per membership type (in INR)
    private static final Map<MembershipType, BigDecimal> BASE_PRICES = Map.of(
            MembershipType.MONTHLY, new BigDecimal("2000.00"),
            MembershipType.QUARTERLY, new BigDecimal("5000.00"),
            MembershipType.ANNUAL, new BigDecimal("15000.00")
    );

    // Access level multipliers
    private static final Map<AccessLevel, BigDecimal> ACCESS_MULTIPLIERS = Map.of(
            AccessLevel.GYM_ONLY, new BigDecimal("1.0"),
            AccessLevel.GYM_POOL, new BigDecimal("1.5"),
            AccessLevel.ALL_FACILITIES, new BigDecimal("2.0")
    );

    private static final BigDecimal TAX_RATE = new BigDecimal("0.18"); // 18% GST

    public BigDecimal calculatePrice(MembershipType type, AccessLevel level) {
        BigDecimal base = BASE_PRICES.getOrDefault(type, BigDecimal.ZERO);
        BigDecimal multiplier = ACCESS_MULTIPLIERS.getOrDefault(level, BigDecimal.ONE);
        return base.multiply(multiplier);
    }

    public BigDecimal calculateTax(BigDecimal amount) {
        return amount.multiply(TAX_RATE).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTotal(BigDecimal amount) {
        return amount.add(calculateTax(amount));
    }
}
