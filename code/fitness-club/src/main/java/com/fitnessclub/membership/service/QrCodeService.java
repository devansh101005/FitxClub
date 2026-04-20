package com.fitnessclub.membership.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Date;

@Service
public class QrCodeService {

    private final SecretKey qrSigningKey;

    public QrCodeService(@Value("${app.qr.secret}") String secret) {
        this.qrSigningKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate a signed QR payload containing memberId and expiry, then encode as Base64 PNG image.
     */
    public String generateQrCode(String memberId, LocalDate expiryDate) {
        String signedPayload = Jwts.builder()
                .subject(memberId)
                .claim("expiry", expiryDate.toString())
                .issuedAt(new Date())
                .signWith(qrSigningKey)
                .compact();

        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(signedPayload, BarcodeFormat.QR_CODE, 300, 300);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Decode and validate a signed QR payload. Returns the claims if valid.
     */
    public Claims validateQrPayload(String signedPayload) {
        return Jwts.parser()
                .verifyWith(qrSigningKey)
                .build()
                .parseSignedClaims(signedPayload)
                .getPayload();
    }
}
