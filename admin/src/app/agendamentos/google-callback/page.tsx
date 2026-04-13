"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin, Alert } from "antd";


export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" tip="Conectando Google Agenda..." /></div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("Código de autorização não encontrado na URL.");
      return;
    }
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      setStatus("error");
      setMessage("Token de autenticação não encontrado. Faça login novamente.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://seu-dominio.com";
    // 1. Troca o code por tokens e email
    fetch(`${apiUrl}/api/google/callback?code=${encodeURIComponent(code)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.tokens && data.email) {
          // 2. Envia tokens e email para o backend associar ao usuário autenticado
          fetch(`${apiUrl}/api/google/accounts/connect`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ email: data.email, tokens: data.tokens })
          })
            .then(async (res2) => {
              const data2 = await res2.json();
              if (res2.ok && data2.success) {
                setStatus("success");
                setMessage("Google Agenda conectada com sucesso!");
                setTimeout(() => router.replace("/agendamentos"), 2000);
              } else {
                setStatus("error");
                setMessage(data2.erro || "Erro ao conectar Google Agenda.");
              }
            })
            .catch(() => {
              setStatus("error");
              setMessage("Erro de comunicação com o servidor.");
            });
        } else {
          setStatus("error");
          setMessage(data.erro || "Erro ao conectar Google Agenda.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de comunicação com o servidor.");
      });
  }, [router, searchParams]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      {status === "loading" && <Spin size="large" tip="Conectando Google Agenda..." />}
      {status !== "loading" && (
        <Alert
          type={status === "success" ? "success" : "error"}
          message={message}
          showIcon
        />
      )}
    </div>
  );
}
