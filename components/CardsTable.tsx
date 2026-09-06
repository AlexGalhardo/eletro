"use client";
import React, { useState, useEffect } from "react";
import { SiMercadopago, SiShopee } from "react-icons/si";
import { FaCheck, FaAmazon } from "react-icons/fa";
import airfryers8LitrosData from "@/data/airfryers-8-litros.json";
import desidratadoresData from "@/data/desidratadores.json";
import churrasqueiraEletricaData from "@/data/churrasqueira-eletrica.json";
import chaleiraEletricaData from "@/data/chaleira-eletrica.json";
import liquidificadorProcessadorData from "@/data/liquidificador-processador.json";
import grillRedondoData from "@/data/grill-redondo.json";
import fornoEletricoSuggarData from "@/data/forno-eletrico-suggar.json";
import maquinaLavarPanasonicData from "@/data/maquina-lavar-panasonic.json";
import vaporizadorArnoData from "@/data/vaporizador-arno.json";
import ferroPassarOsterData from "@/data/ferro-passar-oster.json";
import melhorSecadoraRoupasData from "@/data/melhor-secadora-roupas.json";
import lavaSecaMideaData from "@/data/lava-seca-midea.json";
import geradorGasolinaData from "@/data/melhor-gerador-gasolina.json";
import parafusadeiraComFioData from "@/data/melhor-parafusadeira-com-fio.json";
import aspiradorPoAguaData from "@/data/melhor-aspirador-po-agua.json";
import umidificadorArUltrassonicoData from "@/data/melhor-umidificador-ar-ultrassonico.json";
import poltronaReclinavelData from "@/data/melhor-poltrona-reclinavel.json";
import repelentesEletricosData from "@/data/melhor-repelente-eletrico.json";
import aspiradoresPoElectroluxData from "@/data/melhor-aspirador-po-electrolux.json";
import aspiradorPoVerticalBritaniaData from "@/data/melhor-aspirador-po-vertical-britania.json";
import lavadorasAltaPressaoTeknaData from "@/data/melhor-lavadora-alta-pressao-tekna.json";
import roboAspiradorWAPData from "@/data/melhor-robo-aspirador-wap.json";
import roboAspiradorXiaomiData from "@/data/melhor-robo-aspirador-xiaomi.json";
import umidificadorArParaQuartoData from "@/data/melhor-umidificador-de-ar-para-quarto.json";
import climatizadorQuenteFrioData from "@/data/melhor-climatizador-quente-frio.json";
import ventilador40cmData from "@/data/melhor-ventilador-40cm.json";
import climatizadorMideaData from "@/data/melhor-climatizador-midea.json";
import arCondicionadoElectroluxData from "@/data/melhor-ar-condicionado-electrolux.json";
import mesaDobravelData from "@/data/melhor-mesa-dobravel.json";
import sofaCamaData from "@/data/melhor-sofa-cama.json";
import alicateCorteData from "@/data/melhor-alicate-corte.json";
import furadeiraBoschData from "@/data/melhor-furadeira-bosch.json";
import parafusadeiraBoschData from "@/data/melhor-parafusadeira-bosch.json";
import pistolaPinturaEletricaData from "@/data/melhor-pistola-pintura-eletrica.json";
import melhorPulverizadorData from "@/data/melhor-pulverizador.json";
import rebitadorManualData from "@/data/melhor-rebitador-manual.json";
import varalDeChaoData from "@/data/melhor-varal-chao.json";
import vaporizadorPhilipsWalitaData from "@/data/melhor-vaporizador-philips-walita.json";
import maquinaDeLavarRoupa12kgData from "@/data/melhor-maquina-lavar-roupa-12-kg.json";
import maquinaDeLavarElectroluxData from "@/data/melhor-maquina-lavar-electrolux.json";
import maquinaDeLavarConsulData from "@/data/melhor-maquina-lavar-consul.json";
import maquinaDeLavarBrastempData from "@/data/melhor-maquina-lavar-brastemp.json";
import lavadoraDeRoupasColormaqData from "@/data/melhor-lavadora-de-roupas-colormaq.json";
import lavaESeca11kgData from "@/data/melhor-lava-e-seca-11-kg.json";
import ferroPassarPhilipsWalitaData from "@/data/melhor-ferro-passar-philips-walita.json";
import ferroPassarBritaniaData from "@/data/melhor-ferro-passar-britania.json";
import panelaArrozEletricaData from "@/data/melhor-panela-arroz-eletrica.json";
import geladeiraEosData from "@/data/melhor-geladeira-eos.json";
import moedorEletricoCafeData from "@/data/melhor-moedor-eletrico-cafe.json";
import microondasEmbutirElectroluxData from "@/data/melhor-microondas-embutir-electrolux.json";
import mixerMondialData from "@/data/melhor-mixer-mondial.json";
import geladeiraEsmaltecData from "@/data/melhor-geladeira-esmaltec.json";
import descascadorLegumesTramontinaData from "@/data/melhor-descascador-legumes-tramontina.json";
import cervejeiraEosData from "@/data/melhor-cervejeira-eos.json";
import cooktop1BocaData from "@/data/melhor-cooktop-1-boca.json";
import cooktopSuggarData from "@/data/melhor-cooktop-suggar.json";
import arCondicionadoBaratoData from "@/data/melhor-ar-condicionado-barato.json";
import arCondicionadoEconomicoData from "@/data/melhor-ar-condicionado-economico.json";
import arCondicionadoInverterData from "@/data/melhor-ar-condicionado-inverter.json";
import aquecedorMondialData from "@/data/melhor-aquecedor-mondial.json";
import ventiladorDeTetoData from "@/data/melhor-ventilador-teto.json";
import ventiladorDeColunaData from "@/data/melhor-ventilador-coluna.json";
import melhorVentiladorData from "@/data/melhor-ventilador.json";
import climatizadorDeArData from "@/data/melhor-climatizador.json";

interface TechnicalDetail {
	label: string;
	value: string;
}

interface ProductData {
	id: string;
	name: string;
	brand: string | null;
	description?: string | null;
	image: string;
	mercadolivreUrl?: string | null;
	shopeeUrl?: string | null;
	amazonUrl?: string | null;
	price?: number | null;
	discountPercent?: number | null;
	fastShipping?: boolean;
	advantages?: string[];
	disadvantages?: string[];
	technicalDetails?: TechnicalDetail[];
	specs: {
		ratings: {
			costBenefit: number;
			batteryLife?: number | null;
			trackingAccuracy?: number | null;
			comfort?: number | null;
			sleepTracking?: number | null;
			appQuality?: number | null;
			heatingPerformance?: number | null;
			easeOfUse?: number | null;
			capacity?: number | null;
			features?: number | null;
			disinfectionPower?: number | null;
			packaging?: number | null;
			concentration?: number | null;
			bladeQuality?: number | null;
			versatility?: number | null;
			powerEfficiency?: number | null;
			buildQuality?: number | null;
			capacityVersatility?: number | null;
			durability?: number | null;
			coverageArea?: number | null;
			filterEfficiency?: number | null;
			noiseLevel?: number | null;
			energyEfficiency?: number | null;
			maintenanceEase?: number | null;
			portability?: number | null;
			airQualitySensor?: number | null;
			performance?: number;
			appAvailability?: number;
			voiceControl?: number;
			connectivity?: number;
			cookingPerformance?: number;
			cleaning?: number;
		};
	};
}

interface ProductTableProps {
	category: string;
	activeLearnMore?: boolean;
}

const categoryData: Record<string, ProductData[]> = {
	airfryers8Litros: airfryers8LitrosData as unknown as ProductData[],
	desidratadores: desidratadoresData as unknown as ProductData[],
	churrasqueiraEletrica: churrasqueiraEletricaData as unknown as ProductData[],
	chaleiraEletrica: chaleiraEletricaData as unknown as ProductData[],
	liquidificadorProcessador: liquidificadorProcessadorData as unknown as ProductData[],
	grillRedondo: grillRedondoData as unknown as ProductData[],
	fornoEletricoSuggar: fornoEletricoSuggarData as unknown as ProductData[],
	maquinaLavarPanasonic: maquinaLavarPanasonicData as unknown as ProductData[],
	vaporizadorArno: vaporizadorArnoData as unknown as ProductData[],
	ferroPassarOster: ferroPassarOsterData as unknown as ProductData[],
	melhorSecadoraRoupas: melhorSecadoraRoupasData as unknown as ProductData[],
	lavaSecaMidea: lavaSecaMideaData as unknown as ProductData[],
	geradorGasolina: geradorGasolinaData as unknown as ProductData[],
	parafusadeiraComFio: parafusadeiraComFioData as unknown as ProductData[],
	aspiradorPoAgua: aspiradorPoAguaData as unknown as ProductData[],
	umidificadorArUltrassonico: umidificadorArUltrassonicoData as unknown as ProductData[],
	poltronaReclinavel: poltronaReclinavelData as unknown as ProductData[],
	repelentesEletricos: repelentesEletricosData as unknown as ProductData[],
	aspiradoresPoElectrolux: aspiradoresPoElectroluxData as unknown as ProductData[],
	aspiradorPoVerticalBritania: aspiradorPoVerticalBritaniaData as unknown as ProductData[],
	lavadorasAltaPressaoTekna: lavadorasAltaPressaoTeknaData as unknown as ProductData[],
	roboAspiradorWAP: roboAspiradorWAPData as unknown as ProductData[],
	roboAspiradorXiaomi: roboAspiradorXiaomiData as unknown as ProductData[],
	umidificadoresArQuarto: umidificadorArParaQuartoData as unknown as ProductData[],
	climatizadorQuenteFrio: climatizadorQuenteFrioData as unknown as ProductData[],
	ventilador40cm: ventilador40cmData as unknown as ProductData[],
	climatizadorMidea: climatizadorMideaData as unknown as ProductData[],
	arCondicionadoElectrolux: arCondicionadoElectroluxData as unknown as ProductData[],
	mesaDobravel: mesaDobravelData as unknown as ProductData[],
	sofaCama: sofaCamaData as unknown as ProductData[],
	alicateCorte: alicateCorteData as unknown as ProductData[],
	furadeiraBosch: furadeiraBoschData as unknown as ProductData[],
	parafusadeiraBosch: parafusadeiraBoschData as unknown as ProductData[],
	pistolaPinturaEletrica: pistolaPinturaEletricaData as unknown as ProductData[],
	melhorPulverizador: melhorPulverizadorData as unknown as ProductData[],
	rebitadorManual: rebitadorManualData as unknown as ProductData[],
	varalDeChao: varalDeChaoData as unknown as ProductData[],
	vaporizadorPhilipsWalita: vaporizadorPhilipsWalitaData as unknown as ProductData[],
	maquinaDeLavarRoupa12kg: maquinaDeLavarRoupa12kgData as unknown as ProductData[],
	maquinaDeLavarElectrolux: maquinaDeLavarElectroluxData as unknown as ProductData[],
	maquinaDeLavarConsul: maquinaDeLavarConsulData as unknown as ProductData[],
	maquinaDeLavarBrastemp: maquinaDeLavarBrastempData as unknown as ProductData[],
	lavadoraDeRoupasColormaq: lavadoraDeRoupasColormaqData as unknown as ProductData[],
	lavaESeca11kg: lavaESeca11kgData as unknown as ProductData[],
	ferroPassarPhilipsWalita: ferroPassarPhilipsWalitaData as unknown as ProductData[],
	ferroPassarBritania: ferroPassarBritaniaData as unknown as ProductData[],
	panelaArrozEletrica: panelaArrozEletricaData as unknown as ProductData[],
	geladeiraEos: geladeiraEosData as unknown as ProductData[],
	moedorEletricoCafe: moedorEletricoCafeData as unknown as ProductData[],
	microondasEmbutirElectrolux: microondasEmbutirElectroluxData as unknown as ProductData[],
	mixerMondial: mixerMondialData as unknown as ProductData[],
	geladeiraEsmaltec: geladeiraEsmaltecData as unknown as ProductData[],
	descascadorLegumesTramontina: descascadorLegumesTramontinaData as unknown as ProductData[],
	cervejeiraEos: cervejeiraEosData as unknown as ProductData[],
	cooktop1Boca: cooktop1BocaData as unknown as ProductData[],
	cooktopSuggar: cooktopSuggarData as unknown as ProductData[],
	arCondicionadoBarato: arCondicionadoBaratoData as unknown as ProductData[],
	arCondicionadoEconomico: arCondicionadoEconomicoData as unknown as ProductData[],
	arCondicionadoInverter: arCondicionadoInverterData as unknown as ProductData[],
	aquecedorMondial: aquecedorMondialData as unknown as ProductData[],
	ventiladorDeTeto: ventiladorDeTetoData as unknown as ProductData[],
	ventiladorDeColuna: ventiladorDeColunaData as unknown as ProductData[],
	melhorVentilador: melhorVentiladorData as unknown as ProductData[],
	climatizadorDeAr: climatizadorDeArData as unknown as ProductData[],
};

const MAX_POINTS = 5;

const BORDER_COLORS = ["black"];

export const CardsTable: React.FC<ProductTableProps> = ({ category, activeLearnMore = false }) => {
	const [products, setProducts] = useState<ProductData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		try {
			setLoading(true);

			const data = categoryData[category];
			if (!data) {
				throw new Error(`Category "${category}" not found`);
			}

			const topProducts = data.slice(0, 10);
			setProducts(topProducts);
		} catch (err) {
			console.error("Error loading products:", err);
			setError(true);
		} finally {
			setLoading(false);
		}
	}, [category]);

	const shuffledProducts = React.useMemo(() => {
		const array = [...products];

		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}

		return array;
	}, [products]);

	if (loading) {
		return (
			<div className="my-2.5 flex flex-col gap-5">
				{[...Array(3)].map((_, index) => (
					<div key={index} className="rounded-xl overflow-hidden bg-white dark:bg-black p-5">
						<div className="flex flex-col items-center gap-3">
							<div className="w-[200px] h-[200px] bg-gray-200 dark:bg-zinc-800 animate-pulse rounded"></div>
							<div className="h-6 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded w-3/4"></div>
							<div className="h-12 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded w-1/3"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error || products.length === 0) {
		return (
			<div className="p-5 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-black rounded-lg my-2.5">
				Nenhum produto encontrado para a categoria "{category}".
			</div>
		);
	}

	return (
		<div className="my-2.5 flex flex-col gap-6">
			{shuffledProducts.map((product, index) => {
				const title = `${product.name}`;
				const priorityUrl =
					product.mercadolivreUrl || product.shopeeUrl || product.amazonUrl || "https://meli.la/1gvsK3J";

				const positiveRows: { label?: string; content: React.ReactNode }[] = [];

				if (product.advantages && product.advantages.length > 0) {
					positiveRows.push({
						content: (
							<ul className="flex flex-col gap-1.5">
								{product.advantages.slice(0, MAX_POINTS).map((item, i) => (
									<li
										key={i}
										className="flex items-start gap-2 text-gray-800 dark:text-gray-300 text-lg leading-snug"
									>
										<FaCheck className="text-black dark:text-white mt-1 shrink-0 text-base" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						),
					});
				}

				const technicalRows: { label?: string; content: React.ReactNode }[] = [];

				if (product.technicalDetails && product.technicalDetails.length > 0) {
					product.technicalDetails.forEach((detail) => {
						if (!detail.value || detail.value.trim().toLowerCase() === "não especificado") {
							return;
						}

						technicalRows.push({
							label: detail.label,
							content: <span className="text-gray-800 dark:text-gray-300 text-lg">{detail.value}</span>,
						});
					});
				}

				const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

				return (
					<div
						key={product.id}
						className={`rounded-xl overflow-hidden bg-white dark:bg-black text-black dark:text-white border-2 ${borderColor} dark:border-zinc-800 grid grid-cols-6 max-[768px]:grid-cols-1 items-stretch`}
					>
						<div className="col-span-3 max-[768px]:col-span-1 flex flex-col items-center text-center gap-3 p-6">
							<a
								href={priorityUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="w-[160px] h-[160px] max-[480px]:w-[140px] max-[480px]:h-[140px] flex items-center justify-center shrink-0 p-2.5 no-underline hover:no-underline"
								title={title}
							>
								<img
									src={product.image}
									alt={title}
									className="max-w-full max-h-full object-contain object-center"
									loading="lazy"
									width="full"
									height="full"
								/>
							</a>

							<a
								href={priorityUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[1rem] max-[480px]:text-[0.9rem] font-bold leading-snug no-underline hover:no-underline uppercase line-clamp-3 wrap-break-word max-w-100 text-black dark:text-white! transition-colors duration-75"
								title={title}
							>
								{title}
							</a>

							<div className="flex flex-col gap-2.5 w-full max-w-70">
								{product.mercadolivreUrl && (
									<a
										href={
											product.mercadolivreUrl === "#"
												? "https://meli.la/1gvsK3J"
												: product.mercadolivreUrl
										}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline py-2.5 px-5 max-[480px]:py-2 max-[480px]:px-4 rounded bg-[#fff159] text-black text-[0.8rem] max-[480px]:text-xs font-semibold transition-all duration-75 cursor-pointer w-full text-center whitespace-nowrap shadow-[0_4px_0_0_#ccb800] hover:bg-[#e6d84f] hover:text-black hover:shadow-[0_2px_0_0_#ccb800] hover:translate-y-0.5 active:shadow-[0_0px_0_0_#ccb800] active:translate-y-1 focus:outline focus:outline-blue-600 focus:outline-offset-2 text-decoration-none!"
										title="Ver preço no Mercado Livre"
									>
										<span className="text-lg max-[480px]:text-base flex items-center shrink-0 text-black">
											<SiMercadopago className="text-black" />
										</span>
										<span className="text-black">VER PREÇO MERCADOLIVRE</span>
									</a>
								)}

								{product.shopeeUrl && (
									<a
										href={product.shopeeUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline py-2.5 px-5 max-[480px]:py-2 max-[480px]:px-4 rounded bg-[#ee4d2d] text-white text-[0.8rem] max-[480px]:text-xs font-semibold transition-all duration-75 cursor-pointer w-full text-center whitespace-nowrap shadow-[0_4px_0_0_#b83a20] hover:bg-[#d8431f] hover:shadow-[0_2px_0_0_#b83a20] hover:translate-y-0.5 active:shadow-[0_0px_0_0_#b83a20] active:translate-y-1 focus:outline focus:outline-blue-600 focus:outline-offset-2 text-decoration-none!"
										title="Ver preço na Shopee"
									>
										<span className="text-lg max-[480px]:text-base flex items-center shrink-0 text-white">
											<SiShopee className="text-white" />
										</span>
										<span className="text-white">VER PREÇO SHOPEE</span>
									</a>
								)}

								{product.amazonUrl && (
									<a
										href={product.amazonUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline py-2.5 px-5 max-[480px]:py-2 max-[480px]:px-4 rounded bg-[#232f3e] text-white text-[0.8rem] max-[480px]:text-xs font-semibold transition-all duration-75 cursor-pointer w-full text-center whitespace-nowrap shadow-[0_4px_0_0_#0f151c] hover:bg-[#374357] hover:shadow-[0_2px_0_0_#0f151c] hover:translate-y-0.5 active:shadow-[0_0px_0_0_#0f151c] active:translate-y-1 focus:outline focus:outline-blue-600 focus:outline-offset-2 text-decoration-none!"
										title="Ver preço na Amazon"
									>
										<span className="text-lg max-[480px]:text-base flex items-center shrink-0 text-[#ff9900]">
											<FaAmazon className="text-[#ff9900]" />
										</span>
										<span className="text-white">VER PREÇO AMAZON</span>
									</a>
								)}
							</div>

							{positiveRows.length > 0 && (
								<div className="w-full rounded-lg divide-y divide-gray-200 dark:divide-zinc-800 overflow-hidden text-left">
									{positiveRows.map((row, i) => (
										<div key={i} className="flex flex-col gap-1.5 px-3 py-2.5">
											<span className="font-bold uppercase tracking-wide text-black dark:text-white text-lg">
												{row.label}
											</span>
											<div className="text-lg">{row.content}</div>
										</div>
									))}
								</div>
							)}
						</div>

						{technicalRows.length > 0 && (
							<div className="col-span-3 max-[768px]:col-span-1 p-4 max-[768px]:pt-0 flex items-center">
								<div className="w-full rounded-lg divide-y divide-gray-200 dark:divide-zinc-800 overflow-hidden">
									{technicalRows.map((row, i) => (
										<div
											key={`tech-${i}`}
											className="grid grid-cols-[130px_1fr] max-[480px]:grid-cols-1 gap-x-3 gap-y-1.5 px-3 py-2.5"
										>
											<span className="font-bold uppercase tracking-wide text-black dark:text-white text-lg">
												{row.label}
											</span>
											<div className="text-lg">{row.content}</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
