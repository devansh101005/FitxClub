package com.fitnessclub.admin.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.common.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Demo Reset", description = "Nuke + reseed the database for portfolio demos. Demo-mode only.")
public class DemoResetController {

    private static final Logger log = LoggerFactory.getLogger(DemoResetController.class);

    private final Flyway flyway;

    @Value("${app.demo-mode:false}")
    private boolean demoMode;

    @Value("${app.demo-reset-token:}")
    private String demoResetToken;

    public DemoResetController(Flyway flyway) {
        this.flyway = flyway;
    }

    @PostMapping("/reset-demo")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Clean + re-apply all Flyway migrations. Demo mode only. ADMIN role required.")
    public ResponseEntity<ApiResponse<String>> resetDemo(
            @RequestHeader(value = "X-Reset-Token", required = false) String resetToken) {

        if (!demoMode) {
            throw new BusinessException("Reset is disabled (not running in demo mode)", HttpStatus.FORBIDDEN);
        }

        if (demoResetToken != null && !demoResetToken.isBlank()) {
            if (resetToken == null || !demoResetToken.equals(resetToken)) {
                throw new BusinessException("Invalid reset token", HttpStatus.FORBIDDEN);
            }
        }

        log.warn("Demo reset triggered — cleaning and re-migrating database.");
        flyway.clean();
        flyway.migrate();
        log.warn("Demo reset complete.");

        return ResponseEntity.ok(ApiResponse.success("ok", "Database reset and reseeded."));
    }
}
