import { NextRequest, NextResponse } from "next/server";

const redirectMap: Record<string, string> = {
  "/as-melhores-esteiras-ergometricas-domesticas-para-comprar-em-2025":
    "/como-escolher-esteira-domestica",
  "/os-smartwatch-huawei-relogios-inteligentes-para-praticar-atividade-fisica-em-2025":
    "/smartwatch-huawei",
  "/as-melhores-marcas-brasileiras-de-suplementos-em-2025":
    "/melhores-marcas-suplementos",
  "/o-que-e-dieta-cetogenica-tudo-o-que-voce-precisa-saber":
    "/dieta-cetogenica-guia",
  "/o-que-e-dieta-low-carb-tudo-o-que-voce-precisa-saber":
    "/dieta-low-carb-guia",
  "/o-que-sao-proteinas-e-porque-elas-sao-importantes-para-a-saude":
    "/o-que-sao-proteinas",
  "/o-que-sao-carboidratos-e-porque-sao-importantes-para-a-sua-saude":
    "/o-que-sao-carboidratos",
  "/o-que-e-omega3-e-sua-importancia-para-a-saude": "/omega3-beneficios",
  "/o-que-comer-antes-e-depois-de-atividades-fisicas":
    "/alimentacao-pre-pos-treino",
  "/os-10-melhores-aliementos-naturais-que-existem":
    "/melhores-alimentos-naturais",
  "/os-melhores-alimentos-para-diminuir-estresse-e-ansiedade-e-que-ajudam-a-dormir-melhor":
    "/alimentos-diminuir-ansiedade-estresse",
  "/os-beneficios-e-maleficios-do-cafe-para-a-saude":
    "/cafe-beneficios-maleficios",
  "/como-ganhar-massa-muscular-tudo-o-que-voce-precisa-saber":
    "/como-ganhar-massa-muscular",
  "/como-perder-peso-tudo-o-que-voce-precisa-saber": "/como-perder-peso",
  "/os-melhores-exercicios-para-emagrecer-rapido-em-casa":
    "/exercicios-emagrecer-casa",
  "/diferenca-entre-aerobico-e-musculacao-para-emagrecer-qual-e-melhor":
    "/aerobico-vs-musculacao",
  "/o-que-sao-exercicios-cardiovasculares-e-os-melhores-para-cada-idade":
    "/exercicios-cardiovasculares-guia",
  "/a-importancia-do-sono-e-como-melhorar-a-qualidade-do-sono-naturalmente":
    "/importancia-sono-qualidade",
  "/os-estagios-do-sono-tudo-o-que-voce-precisa-saber": "/estagios-sono-guia",
  "/o-que-e-meditacao-para-que-serve-e-como-comecar-a-praticar":
    "/meditacao-guia-iniciantes",
  "/alcool-prejudica-a-saude-tudo-o-que-voce-precisa-saber":
    "/alcool-efeitos-saude",
  "/melhores-notebooks-estudo": "/notebooks-estudo-trabalhos-leves",
  "/melhores-placa-video": "/como-escolher-placa-de-video",
  "/melhor-teclado": "/melhor-teclado",
  "/o-que-e-fps": "/fps-dlss-fsr-xess",
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const slug = pathname.replace(/^\/+/, "");
  const redirectTo = redirectMap[slug];

  if (!redirectTo) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/${redirectTo}`, request.url), 301);
}
