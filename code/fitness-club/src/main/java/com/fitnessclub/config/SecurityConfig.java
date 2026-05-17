package com.fitnessclub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/facilities").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/facilities/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/classes/schedule").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/trainers").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/trainers/{id}").permitAll()
                // Member endpoints
                .requestMatchers("/api/members/register").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers("/api/members/me").hasRole("MEMBER")
                .requestMatchers("/api/members/{id}").hasAnyRole("MANAGER", "ADMIN")
                // Reservation endpoints (method-level @PreAuthorize handles role checks)
                .requestMatchers("/api/reservations/**").hasRole("MEMBER")
                // Personal training - members book, trainers/members update status
                .requestMatchers(HttpMethod.POST, "/api/pt-sessions").hasRole("MEMBER")
                .requestMatchers(HttpMethod.GET, "/api/pt-sessions/me").hasRole("MEMBER")
                .requestMatchers(HttpMethod.PUT, "/api/pt-sessions/{id}/status").authenticated()
                // Access control (receptionist scans QR at entry)
                .requestMatchers("/api/access/**").hasAnyRole("RECEPTIONIST", "ADMIN")
                // Trainer endpoints (profile, availability, schedule, PT sessions)
                .requestMatchers("/api/trainer/**").hasRole("TRAINER")
                // Payment endpoints (method-level @PreAuthorize handles role checks)
                .requestMatchers("/api/payments/**").authenticated()
                // Admin endpoints
                .requestMatchers(HttpMethod.GET, "/api/admin/analytics/**").hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MANAGER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
