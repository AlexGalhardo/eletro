export type ProductCategory =
	| "cafeteiras"
	| "smartwatches"
	| "smartphones"
	| "tablets"
	| "notebooks"
	| "smart-tvs"
	| "fones-de-ouvido"
	| "drones"
	| "cameras"
	| "teclados"
	| "geladeiras"
	| "ar-condicionado"
	| "cameras-de-seguranca"
	| "maquina-lavar-roupas"
	| "impressoras"
	| "caixa-de-som"
	| "fechaduras";

export interface Impressora extends BaseProduct {
	category: "impressoras";
	specs: ImpressoraSpecs;
}

export interface CameraDeSeguranca extends BaseProduct {
	category: "cameras-de-seguranca";
	specs: CameraDeSegurancaSpecs;
}

export interface Geladeira extends BaseProduct {
	category: "geladeiras";
	specs: GeladeiraSpecs;
}

export interface GeladeiraSpecs {
	totalCapacityL: number;
	fridgeCapacityL: number;
	freezerCapacityL: number;

	widthCm: number;
	depthCm: number;
	heightCm: number;
	weightKg: number;

	doors: number;

	defrostType: "frost-free" | "manual" | "cycle-defrost";
	energyRating: string;

	inverter: boolean;
	controlPanel: "mecânico" | "digital" | "táctil";
	temperatureLevels?: number;

	freezerLocation: "superior" | "inferior";
	freezerShelves?: number;
	fridgeShelves?: number;

	iceMaker: boolean;
	wifi: boolean;
	doorAlarm: boolean;
	waterDispenser: boolean;
	iceDispenser: boolean;
	fastFreeze: boolean;
	deodorizerFilter: boolean;
	reversibleDoors: boolean;
	internalLight: boolean;

	multiAirFlow?: boolean;
	bottleRack?: boolean;
	canRack?: boolean;
	eggTray?: boolean;
	multiPurposeDrawer?: boolean;
	vegetableDrawer?: boolean;
	freezerDrawers?: number;

	ratings: {
		costBenefit: number | null;
		efficiency: number;
		internalSpace: number;
		buildQuality: number;
		features: number;
	};
}

export interface CaixaDeSom extends BaseProduct {
	category: "caixa-de-som";
	specs: CaixaDeSomSpecs;
}

export interface CaixaDeSomSpecs {
	type: "Portátil" | "Home" | "Soundbar" | "Torre" | "Bookshelf" | "Subwoofer";
	audio: {
		power: {
			rms: number;
			peak?: number;
			unit: "W";
		};
		drivers: {
			configuration?: string;
			woofer?: string;
			tweeter?: string;
			midrange?: string;
			subwoofer?: string;
			passive?: boolean;
		};
		frequency: {
			min: number;
			max: number;
			unit: "Hz" | "kHz";
		};
		impedance?: string;
		sensitivity?: string;
		snr?: string;
	};
	connectivity: {
		bluetooth?: {
			version?: string;
			range?: string;
			multipoint?: boolean;
			codec?: string[];
		};
		wifi?: {
			standards?: string[];
			multiroom?: boolean;
		};
		wired?: {
			aux?: boolean;
			optical?: boolean;
			usb?: boolean;
			hdmi?: boolean;
			rca?: boolean;
		};
		nfc?: boolean;
	};
	features: {
		waterproof?: string;
		dustproof?: string;
		portability?: boolean;
		stereo?: boolean;
		partyMode?: boolean;
		twsTechnology: boolean;
		voiceAssistant?: string[];
		eqSettings?: boolean;
		customEQ?: boolean;
		app?: boolean;
		ledLights?: boolean;
		micInput?: boolean;
		karaoke?: boolean;
	};
	battery?: {
		capacity?: string;
		playTime?: string;
		chargingTime?: string;
		quickCharge?: boolean;
		powerBank?: boolean;
	};
	power?: {
		type?: string;
		voltage?: string;
		acAdapter?: boolean;
	};
	build: {
		material?: string;
		dimensions: {
			width: string;
			height: string;
			depth: string;
			weight: string;
		};
		mounting?: string[];
	};
	controls: {
		type?: string;
		volume?: boolean;
		playback?: boolean;
		voiceControl?: boolean;
		touch?: boolean;
	};
	accessories?: string[];
	ratings: {
		costBenefit: number | null;
		soundQuality: number;
		bassResponse: number;
		portability: number;
		batteryLife: number;
	};
}

export interface CameraDeSegurancaSpecs {
	type: "Interna" | "Externa" | "Dome" | "Bullet" | "PTZ";
	resolution: string;
	videoQuality: {
		maxResolution: string;
		fps: number;
		hdr?: boolean;
		nightVision?: boolean;
		nightVisionRange?: string;
	};
	lens: {
		type?: string;
		focalLength?: string;
		aperture?: string;
		viewingAngle: string;
		zoom?: string;
	};
	sensor: {
		type?: string;
		size?: string;
		megapixels: number;
	};
	connectivity: {
		wifi?: boolean;
		wifiStandards?: string[];
		ethernet?: boolean;
		bluetooth?: boolean;
		cellular?: boolean;
	};
	storage: {
		internal?: string;
		sdCard?: boolean;
		maxSdCard?: string;
		cloud?: boolean;
		nvr?: boolean;
	};
	audio: {
		microphone?: boolean;
		speaker?: boolean;
		twoWayAudio?: boolean;
	};
	power: {
		type: string;
		poe?: boolean;
		battery?: boolean;
		batteryLife?: string;
		voltage?: string;
	};
	features: {
		motionDetection?: boolean;
		personDetection?: boolean;
		faceRecognition?: boolean;
		soundDetection?: boolean;
		alerts?: boolean;
		scheduling?: boolean;
		privacyMode?: boolean;
		pan?: boolean;
		tilt?: boolean;
		zoom?: boolean;
		autoTracking?: boolean;
	};
	environmental: {
		ipRating?: string;
		operatingTemp?: string;
		weatherResistant?: boolean;
	};
	app?: {
		name?: string;
		platforms?: string[];
		remoteAccess?: boolean;
	};
	dimensions?: {
		width?: string;
		height?: string;
		depth?: string;
		weight?: string;
	};
	ratings: {
		costBenefit: number | null;
		videoQuality: number;
		nightVision: number;
		easeOfUse: number;
		features: number;
	};
}
export interface ImpressoraSpecs {
	manufacturer:
		| "HP"
		| "Epson"
		| "Canon"
		| "Brother"
		| "Samsung"
		| "Xerox"
		| "Lexmark"
		| "Ricoh"
		| "Kyocera"
		| "Outros";
	type: "Multifuncional" | "Impressora" | "Copiadora" | "Scanner";
	printingTechnology: "Jato de tinta" | "Laser" | "Térmica" | "Matricial" | "Sublimação" | "Tanque de tinta";
	printType: "Cor" | "Monocromática" | "Preto e branco";
	functions: ("Impressão" | "Cópia" | "Digitalização" | "Fax")[];

	connectivity: {
		wifi?: boolean;
		bluetooth?: boolean;
		ethernet?: boolean;
		usb?: boolean;
		nfc?: boolean;
		mobileConnections?: string[]; // Wi-Fi Direct, AirPrint, Mopria
		usbType?: string; // USB 2.0, USB 3.0
		ethernetSpeed?: string; // 10/100 Mbps, Gigabit
	};

	printing: {
		maxResolutionBlackWhite?: string; // dpi
		maxResolutionColor?: string; // dpi
		maxSpeedBlackWhite?: number; // ppm (páginas por minuto)
		maxSpeedColor?: number; // ppm
		firstPageOut?: string; // tempo em segundos
		duplexPrinting?: "Automático" | "Manual" | "Não";
		monthlyCycle?: number; // páginas por mês
		recommendedVolume?: string; // páginas por mês
		languages?: string[]; // PCL, PostScript, PDF
	};

	paper: {
		types?: string[]; // A4, Carta, Legal, Fotográfico, Envelope
		sizes?: string[]; // A4, A5, A6, Carta, Ofício
		maxCapacity: number; // folhas
		trays: number;
		maxWeight?: number; // g/m²
		minWeight?: number; // g/m²
		customSizes?: boolean;
		borderlessPrinting?: boolean;
	};

	scanner?: {
		type?: "Flatbed" | "ADF" | "Duplex ADF" | "Flatbed + ADF";
		maxResolution?: string; // dpi
		scanSpeed?: string; // páginas por minuto
		adfCapacity?: number; // folhas
		scanArea?: string; // dimensões
		fileFormats?: string[]; // PDF, JPEG, TIFF, PNG
		colorDepth?: string; // bits
		duplexScanning?: boolean;
	};

	copier?: {
		maxCopies?: number;
		copySpeed?: string; // cpm (cópias por minuto)
		reduction?: string; // percentual
		enlargement?: string; // percentual
		idCopy?: boolean;
	};

	fax?: {
		speed?: string;
		memory?: string;
		resolution?: string;
		autoRedialing?: boolean;
		speedDial?: number;
	};

	ink: {
		cartridges: number;
		cartridgeType?: "Cartucho" | "Tanque de tinta" | "Toner";
		colors?: string[]; // Preto, Ciano, Magenta, Amarelo
		cartridgeYield?: {
			black?: string; // páginas
			color?: string; // páginas
		};
		tankSystem?: boolean;
		inkBottles?: string[];
	};

	display?: {
		hasDisplay: boolean;
		type?: "LCD" | "LED" | "Touchscreen" | "OLED";
		size?: string; // polegadas
		color?: boolean;
		touchscreen?: boolean;
		resolution?: string;
	};

	specifications: {
		portable?: boolean;
		processorSpeed?: string;
		memory?: string; // RAM
		storage?: string; // Memória interna
		energyEfficiency?: string; // A, B, C, etc.
		operatingSystem?: string;
		supportedOS?: string[]; // Windows, macOS, Linux, Android, iOS
	};

	power: {
		voltage?: string; // 110V, 220V, Bivolt
		powerConsumption?: string; // Watts
		standbyPower?: string; // Watts
		sleepMode?: boolean;
		autoShutoff?: boolean;
	};

	dimensions?: {
		height: string;
		width: string;
		depth: string;
		weight?: string;
	};

	environmental?: {
		energyStar?: boolean;
		ecoMode?: boolean;
		recyclable?: boolean;
		certifications?: string[]; // Energy Star, Blue Angel, EPEAT
	};

	security?: {
		passwordProtection?: boolean;
		encryption?: string[];
		secureErase?: boolean;
		pinPrinting?: boolean;
	};

	features: {
		cloudPrinting?: boolean;
		mobilePrinting?: boolean;
		automaticDocumentFeeder?: boolean;
		adfCapacity?: number;
		twoSidedId?: boolean;
		voiceActivated?: boolean;
		smartTasks?: boolean;
		colorDisplay?: boolean;
		quietMode?: boolean;
	};

	software?: {
		included?: string[];
		compatible?: string[];
		driverSupport?: string[];
		mobileApps?: string[];
	};

	bundled?: {
		cables?: string[];
		cartridges?: string[];
		software?: string[];
		accessories?: string[];
	};

	warranty?: {
		period: string;
		type?: string;
		support?: string;
	};

	ratings: {
		costBenefit: number | null;
		printQuality: number;
		speed: number;
		connectivity: number;
		reliability: number;
		features: number;
		costPerPage: number;
	};
}

export interface BaseProduct {
	id: string;
	name: string;
	brand: string;
	line?: string;
	model: string;
	detailedModel?: string;
	color?: string;
	image: string;
	price: number;
	releaseDate: string;
	releaseMonth?: string;
	releaseYear?: number;
	origin?: string;
	category: ProductCategory;
	subcategory?: string;
	anatelNumber?: string;
	amazonUrl?: string;
	mercadolivreUrl?: string;
	shopeeUrl?: string;
	alphanumericModel?: string;
	version?: string;
	manufacturer?: string;
}

export interface Fechadura extends BaseProduct {
	category: "fechaduras";
	specs: FechaduraSpecs;
}

export interface FechaduraSpecs {
	manufacturer:
		| "Intelbras"
		| "Yale"
		| "Samsung"
		| "Xiaomi"
		| "Positivo"
		| "Garen"
		| "Linear"
		| "Aroeira"
		| "Papaiz"
		| "Outros";

	basicInfo: {
		color?: string;
		finish?: string; // Grafite, Cromado, Escovado
		direction: "Direita" | "Esquerda" | "Direita/Esquerda" | "Reversível";
		isDigital: boolean;
		installationType: "De sobrepor" | "De embutir" | "Externa" | "Interna";
		useEnvironment: ("Interno" | "Externo" | "Ambos")[];
	};

	security: {
		openingMechanisms: (
			| "Senha"
			| "Código"
			| "Biometria"
			| "Cartão RFID"
			| "Tag"
			| "Aplicativo"
			| "Chave mecânica"
			| "Controle remoto"
			| "Bluetooth"
		)[];
		proximityCardType?: "RFID" | "Mifare" | "NFC" | "Outros";
		numericCodesSupported?: number;
		biometricCapacity?: number; // quantidade de digitais
		cardCapacity?: number; // quantidade de cartões
		passwordCapacity?: number; // quantidade de senhas
		antiTheftAlarm?: boolean;
		shockProtection?: boolean;
		tamperAlert?: boolean;
		autoLock?: boolean;
		autoLockTime?: string; // tempo em segundos
		emergencyPower?: boolean; // bateria de emergência externa
		securityLevel?: string;
	};

	connectivity: {
		wifi?: boolean;
		bluetooth?: boolean;
		zigbee?: boolean;
		hasApp?: boolean;
		appName?: string;
		remoteControl?: boolean;
		smartHomeIntegration?: string[]; // Alexa, Google Home, etc.
	};

	access: {
		masterPassword?: boolean;
		guestPassword?: boolean;
		temporaryPassword?: boolean;
		oneTimePassword?: boolean;
		accessLog?: boolean;
		logCapacity?: number; // quantidade de registros
	};

	power: {
		powerType: "Pilha" | "Bateria" | "Energia elétrica" | "Híbrido";
		batteryType?: "AA" | "AAA" | "Bateria recarregável" | "9V";
		batteryQuantity?: number;
		batteriesIncluded?: boolean;
		batteryLife?: string; // em meses ou anos
		lowBatteryIndicator?: boolean;
		emergencyPowerPort?: boolean; // USB ou 9V externo
	};

	doorSpecifications: {
		minThickness?: number; // cm
		maxThickness?: number; // cm
		recommendedThickness?: string;
		doorTypes?: string[]; // Madeira, Metal, Vidro
		lockType?: "Trava" | "Trinco" | "Deadbolt" | "Eletroimã";
	};

	display?: {
		hasDisplay: boolean;
		type?: "LCD" | "LED" | "OLED" | "Touch Screen";
		touchScreen?: boolean;
		backlight?: boolean;
	};

	physical: {
		materials: string[]; // Alumínio, Plástico ABS, Zinco, Aço inoxidável
		weatherResistant?: boolean;
		waterproofRating?: string; // IP65, IP67, etc.
		includesHandle?: boolean;
		handleType?: string;
		finishType?: string;
	};

	dimensions?: {
		height: string;
		width: string;
		depth: string;
		weight?: string;
	};

	installation: {
		difficulty?: "Fácil" | "Média" | "Difícil" | "Profissional";
		includesInstallationKit?: boolean;
		reversible?: boolean; // pode inverter lado de abertura
		requiresWiring?: boolean;
	};

	features: {
		voiceGuide?: boolean;
		privacyMode?: boolean;
		silentMode?: boolean;
		freezeProtection?: boolean;
		fireProtection?: boolean;
		duplicateCardProtection?: boolean;
		wrongPasswordLock?: boolean;
		wrongPasswordAttempts?: number;
		lockoutTime?: string; // tempo de bloqueio após tentativas erradas
	};

	notifications: {
		doorOpenAlert?: boolean;
		intrusionAlert?: boolean;
		lowBatteryAlert?: boolean;
		soundAlerts?: boolean;
		visualAlerts?: boolean;
	};

	bundled?: {
		cards?: number;
		tags?: number;
		keys?: number;
		installationKit?: boolean;
		fixingBox?: boolean;
		shims?: number; // calços
		manual?: boolean;
		accessories?: string[];
	};

	warranty?: {
		period: string;
		type?: string;
		support?: string;
	};

	certifications?: {
		anatel?: boolean;
		inmetro?: boolean;
		ce?: boolean;
		fcc?: boolean;
		other?: string[];
	};

	ratings: {
		costBenefit: number | null;
		security: number;
		easeOfUse: number;
		durability: number;
		installation: number;
		features: number;
		connectivity: number;
	};
}

export interface ArCondicionado extends BaseProduct {
	category: "ar-condicionado";
	specs: ArCondicionadoSpecs;
}

export interface ArCondicionadoSpecs {
	manufacturer:
		| "LG"
		| "Samsung"
		| "Midea"
		| "Electrolux"
		| "Daikin"
		| "Gree"
		| "Carrier"
		| "Fujitsu"
		| "Springer"
		| "Philco"
		| "Consul"
		| "Elgin"
		| "Outros";
	type: "Split" | "Split Hi-Wall" | "Split Piso Teto" | "Cassete" | "Janela" | "Portátil" | "Multi-Split" | "VRF";
	technology: "Inverter" | "On/Off" | "Dual Inverter" | "Digital Inverter";
	capacity: {
		btu: number; // 9000, 12000, 18000, 24000, 30000
		watts: number;
		coverage: {
			minArea: number; // m²
			maxArea: number; // m²
			idealArea: number; // m²
		};
	};
	efficiency: {
		energyClass: "A" | "B" | "C" | "D" | "E";
		eer?: number; // Energy Efficiency Ratio
		cop?: number; // Coefficient of Performance
		procelSeal?: string;
		annualConsumption?: string; // kWh/ano
	};
	cooling: {
		capacity: string; // BTU/h
		powerConsumption: string; // Watts
		eer?: number;
		operatingRange: {
			minTemp: number; // °C
			maxTemp: number; // °C
		};
	};
	heating?: {
		capacity: string; // BTU/h
		powerConsumption: string; // Watts
		cop?: number;
		operatingRange: {
			minTemp: number; // °C
			maxTemp: number; // °C
		};
	};
	electrical: {
		voltage: "110V" | "220V" | "Bivolt";
		phases: "Monofásico" | "Bifásico" | "Trifásico";
		frequency: string; // 60Hz
		powerConsumption: {
			cooling: string;
			heating?: string;
			standby?: string;
		};
		currentRating: string; // Amperes
		wireGauge?: string;
		circuitBreaker?: string;
	};
	refrigerant: {
		type: string; // R-410A, R-32, R-290
		amount: string; // gramas
		gwp?: number; // Global Warming Potential
		environmentalImpact: "Baixo" | "Médio" | "Alto";
	};
	airflow: {
		indoorUnit: {
			coolingMode: string; // m³/h
			heatingMode?: string; // m³/h
			fanSpeeds: number;
			autoMode: boolean;
		};
		outdoorUnit?: {
			airflow: string; // m³/h
		};
	};
	noise: {
		indoorUnit: {
			min: number; // dB(A)
			max: number; // dB(A)
			silentMode?: number; // dB(A)
		};
		outdoorUnit: {
			level: number; // dB(A)
		};
	};
	filters: {
		types: string[]; // "Anti-poeira", "Anti-bacteriano", "HEPA", "Carvão Ativado", "Ionizador"
		washable: boolean;
		replacement?: string; // Período de troca
	};
	features: {
		wifi: boolean;
		smartControl: boolean;
		voiceControl?: string[]; // "Alexa", "Google Assistant"
		mobileApp?: string;
		sleepMode: boolean;
		ecoMode: boolean;
		turboMode: boolean;
		dryMode: boolean;
		fanMode: boolean;
		autoClean: boolean;
		autoRestart: boolean;
		timer: boolean;
		timerHours?: number;
		display: boolean;
		displayType?: string; // "LED", "LCD"
		remoteControl: boolean;
		swingHorizontal: boolean;
		swingVertical: boolean;
		swingAuto: boolean;
		ionizer: boolean;
		airPurifier: boolean;
		dehumidifier: boolean;
		followMe?: boolean;
		iFeelSensor?: boolean;
		coldPlasma?: boolean;
		childLock: boolean;
	};
	indoorUnit: {
		dimensions: {
			width: string; // mm
			height: string; // mm
			depth: string; // mm
		};
		weight: string; // kg
		color?: string;
		material?: string;
		displayLocation?: string;
		installation: "Parede" | "Teto" | "Piso" | "Embutido" | "Janela";
	};
	outdoorUnit: {
		dimensions: {
			width: string; // mm
			height: string; // mm
			depth: string; // mm
		};
		weight: string; // kg
		material?: string;
		compressor: {
			type: string; // "Rotativo", "Scroll", "Pistão"
			brand?: string;
		};
		protection: {
			anticorrosion: boolean;
			weatherproof: boolean;
			ipRating?: string;
		};
	};
	installation: {
		type: string; // "Split", "Janela", etc
		tubeLength: {
			included: string; // metros
			maximum: string; // metros
		};
		heightDifference?: string; // metros (diferença de altura entre unidades)
		drain: {
			type: string; // "Gravidade", "Bomba"
			included: boolean;
		};
		mounting: {
			bracket: boolean;
			screws: boolean;
			template: boolean;
		};
		difficulty: "Fácil" | "Média" | "Difícil" | "Profissional";
		estimatedTime?: string;
		professionalRequired: boolean;
	};
	warranty: {
		general: string; // anos
		compressor?: string; // anos
		parts?: string;
		labor?: string;
		conditions?: string[];
	};
	certifications: {
		inmetro: boolean;
		procel?: string;
		iso?: string[];
		ansi?: boolean;
		other?: string[];
	};
	compatibility?: {
		exteriorUnits?: string[];
		smartHome?: string[];
		voltageRange?: string;
	};
	maintenance: {
		filterCleaning: string; // Frequência recomendada
		professionalService: string; // Frequência recomendada
		gasRefill?: string;
		estimatedLifespan?: string;
	};
	bundled?: {
		remoteControl: boolean;
		batteries?: boolean;
		installationKit?: boolean;
		drainHose?: boolean;
		sealingKit?: boolean;
		manual: boolean;
		warrantyCard: boolean;
		accessories?: string[];
	};
	environment: {
		operatingTemp: {
			cooling: {
				min: number; // °C
				max: number; // °C
			};
			heating?: {
				min: number; // °C
				max: number; // °C
			};
		};
		operatingHumidity?: {
			min: number; // %
			max: number; // %
		};
		recommendedUse?: string[];
	};
	ratings: {
		costBenefit: number | null;
		efficiency: number;
		quietness: number;
		coolingPower: number;
		features: number;
		durability: number;
		easeOfUse: number;
	};
}

export interface TecladoPC extends BaseProduct {
	category: "teclados";
	specs: TecladoPCSpecs;
}

export interface TecladoPCSpecs {
	type: "Mecânico" | "Membrana" | "Semi-mecânico" | "Óptico";
	layout: string;
	size: "Full Size" | "TKL" | "75%" | "65%" | "60%" | "40%";
	switches?: {
		type?: string;
		brand?: string;
		actuationForce?: string;
		travelDistance?: string;
		lifespan?: string;
		hotSwappable?: boolean;
	};
	keycaps: {
		material?: string;
		profile?: string;
		printMethod?: string;
		doubleShot?: boolean;
	};
	connectivity: {
		type: "Com fio" | "Sem fio" | "Híbrido";
		wireless?: {
			bluetooth?: boolean;
			rf24ghz?: boolean;
			multiDevice?: boolean;
			maxDevices?: number;
		};
		cable?: {
			type?: string;
			length?: string;
			detachable?: boolean;
		};
	};
	backlighting?: {
		type: "Nenhum" | "Single Color" | "RGB" | "Per-Key RGB";
		software?: string;
		effects?: string[];
		brightness?: number;
	};
	features: {
		nkro?: boolean;
		antiGhosting?: boolean;
		macroKeys?: number;
		mediaKeys?: boolean;
		volumeWheel?: boolean;
		wristRest?: boolean;
		programmable?: boolean;
		onboardMemory?: boolean;
		passthrough?: boolean;
	};
	battery?: {
		type?: string;
		capacity?: string;
		life?: string;
		rechargeable?: boolean;
	};
	build: {
		frame?: string;
		plate?: string;
		weight?: string;
	};
	software?: {
		name?: string;
		features?: string[];
		platforms?: string[];
	};
	dimensions: {
		width: string;
		height: string;
		depth: string;
		weight: string;
	};
	compatibility: string[];
	ratings: {
		costBenefit: number | null;
		typingExperience: number;
		buildQuality: number;
		features: number;
		gaming: number;
	};
}

export interface Drone extends BaseProduct {
	category: "drones";
	specs: DroneSpecs;
}

export interface MaquinaLavarRoupas extends BaseProduct {
	category: "maquina-lavar-roupas";
	specs: MaquinaLavarRoupasSpecs;
}

export interface MaquinaLavarRoupasSpecs {
	type: "Automática" | "Semiautomática" | "Manual";
	loadType: "Superior" | "Frontal";
	capacity: {
		washing: string;
		drying?: string;
	};
	isWasherDryer: boolean;
	energyEfficiency?: "A+++" | "A++" | "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G";
	washing: {
		waterLoadType: "Automática" | "Manual";
		programs: number;
		waterLevels?: number;
		washSystem: "Agitação" | "Impeller" | "Americano" | "Europeu" | "Turbilhão";
		quickWash?: boolean;
		antiWrinkle?: boolean;
		autoAdaptableLoad?: boolean;
		specificPrograms?: string[];
		steamWash?: boolean;
		sanitize?: boolean;
		allergenCycle?: boolean;
		delicateCycle?: boolean;
	};
	spin: {
		hasSpin: boolean;
		speed?: string;
		speedRegulation?: boolean;
		autoBalance?: boolean;
	};
	drying?: {
		type?: "Condensação" | "Ventilação" | "Bomba de Calor";
		hasDrainPump?: boolean;
	};
	technology: {
		inverter?: boolean;
		smartControl?: boolean;
		wifi?: boolean;
		voiceControl?: string[];
		delayedStart?: boolean;
		endAlarm?: boolean;
		loadSensor?: boolean;
		autoDispense?: boolean;
		aiFeatures?: string[];
	};
	temperature: {
		hasRegulation?: boolean;
		waterTemp?: "Quente e Fria" | "Fria" | "Quente";
		options?: string[];
	};
	structure: {
		hasFilter: boolean;
		hasDisplay?: boolean;
		displayType?: "Digital" | "LED" | "Botões de acionamento manual" | "Touch";
		panelLock?: boolean;
		doorLock?: boolean;
		controlType: "Manípulos" | "Botões" | "Touch" | "Misto";
		basketCount?: number;
		basketMaterial: "Aço inoxidável" | "Plástico" | "Porcelana";
		isPortable?: boolean;
		drumLight?: boolean;
	};
	dimensions: {
		height: string;
		width: string;
		depth: string;
		weight: string;
	};
	other?: {
		isIndustrial?: boolean;
		positiveImpact?: boolean;
		warranty?: string;
		color?: string;
		noiseLevel?: string;
		waterConsumption?: string;
		energyConsumption?: string;
		powerInput?: string;
	};
	ratings: {
		costBenefit: number | null;
		washingPerformance: number;
		energyEfficiency: number;
		noiseLevel: number;
		durability: number;
	};
}

export interface DroneSpecs {
	type: "Aéreo" | "Aquático" | "Terrestre" | "Híbrido";
	isMini: boolean;
	isFoldable?: boolean;
	camera: {
		hasCamera: boolean;
		resolution?: "720p" | "HD" | "Full HD" | "2K" | "2.7K" | "4K" | "5.4K" | "6K" | "8K";
		sensor?: string;
		megapixels?: number;
		fov?: string;
		aperture?: string;
		iso?: string;
		shutterSpeed?: string;
		fps?: string;
		hasDualCamera?: boolean;
		hasNightVision?: boolean;
		hasThermalCamera?: boolean;
		photoFormats?: string[];
		videoFormats?: string[];
		hasRawSupport?: boolean;
		bitrate?: string;
	};
	gimbal?: {
		hasGimbal: boolean;
		type?: "Mecânico" | "Eletrônico" | "Híbrido";
		axes?: "1-Axis" | "2-Axis" | "3-Axis" | "4-Axis";
		tiltRange?: string;
		panRange?: string;
		rollRange?: string;
		stabilization?: string[];
	};
	flight: {
		maxFlightTime: string;
		maxSpeed?: string;
		maxDistance?: string;
		maxAltitude?: string;
		windResistance?: string;
		motors: number;
		propellerSize?: string;
	};
	battery: {
		capacity?: string;
		voltage?: string;
		type?: string;
		quantity: number;
		chargingTime?: string;
		intelligentBattery?: boolean;
		fastCharging?: boolean;
	};
	transmission: {
		range?: string;
		frequency?: string;
		technology?: string;
		maxResolution?: string;
		latency?: string;
		liveView?: boolean;
	};
	controller: {
		hasController: boolean;
		type?: "Controle padrão" | "Smart Controller" | "RC Pro" | "FPV Goggles" | "Smartphone";
		screenSize?: string;
		hasBuiltInScreen?: boolean;
		batteryLife?: string;
		controlledBySmartphone?: boolean;
		hasTouch?: boolean;
	};
	obstacleAvoidance?: {
		hasObstacleAvoidance: boolean;
		type?: "Visual" | "Infrared" | "ToF" | "LiDAR" | "Ultrasonic" | "Radar" | "Multi-sensor";
		directions?: string[];
		detectionRange?: string;
		omniDirectional?: boolean;
		apas?: string;
	};
	positioning: {
		hasGPS: boolean;
		gpsType?: string[];
		hasVisionPositioning?: boolean;
		hasInfraredPositioning?: boolean;
		rtkPositioning?: boolean;
	};
	intelligentFeatures: {
		autoReturn?: boolean;
		followMe?: boolean;
		activeTrack?: boolean;
		pointOfInterest?: boolean;
		waypoint?: boolean;
		tapFly?: boolean;
		gesture?: boolean;
		quickShots?: string[];
		panorama?: boolean;
		hyperlapse?: boolean;
		masterShots?: boolean;
		spin360?: boolean;
		altitudeHold?: boolean;
		headlessMode?: boolean;
		aiTracking?: boolean;
		voiceControl?: boolean;
	};
	connectivity: {
		hasWiFi: boolean;
		wiFiFrequency?: string;
		hasBluetooth?: boolean;
		hasUSB?: boolean;
		ports?: string[];
	};
	storage?: {
		internal?: string;
		externalSupport?: string;
		maxCardSize?: string;
	};
	temperature?: {
		min?: string;
		max?: string;
	};
	dimensions: {
		folded?: string;
		unfolded?: string;
		weight: string;
	};
	accessories?: {
		hasProtectors: boolean;
		includedItems?: string[];
		carryingCase?: boolean;
	};
	certifications?: {
		anatelNumber?: string;
		fccId?: string;
		ceMarking?: boolean;
	};
	other?: {
		isFPV?: boolean;
		isRacing?: boolean;
		waterResistance?: string;
		recommendedUses?: string[];
		minAge?: number;
		noiseLevel?: string;
		ledLights?: boolean;
		warranty?: string;
	};
	ratings: {
		costBenefit: number | null;
		cameraQuality: number;
		flightPerformance: number;
		features: number;
		portability: number;
	};
}

export interface Camera extends BaseProduct {
	category: "cameras";
	specs: CameraSpecs;
}

export interface CameraSpecs {
	type: string; // DSLR, Mirrorless, Action, Compact, Cinema, 360°
	sensor: {
		type: string; // Full Frame, APS-C, Micro Four Thirds, 1", etc
		size: string; // 35.9 x 24mm, 23.5 x 15.6mm
		resolution: string; // 24.2 MP, 45.7 MP
		megapixels: number;
		cropFactor?: string;
		iso: {
			native: string; // 100-32000
			expanded?: string; // 50-102400
			max: number;
		};
		stabilization: boolean;
		ibis?: boolean; // In-Body Image Stabilization
		stabilizationType?: string; // 5-axis, 3-axis
		dualNativeIso?: boolean;
	};
	processor: string;
	autofocus: {
		type: string; // Phase Detection, Contrast Detection, Hybrid
		points: number;
		faceDetection: boolean;
		eyeDetection: boolean;
		animalDetection?: boolean;
		tracking: boolean;
		touchFocus?: boolean;
		lowLightSensitivity?: string; // -6 EV
	};
	video: {
		maxResolution: string; // 4K, 8K, 6K
		maxFrameRate: string; // 60fps, 120fps, 240fps
		fourKFrameRates?: string[]; // ["24p", "30p", "60p", "120p"]
		fullHdFrameRates?: string[];
		slowMotion?: string;
		codec: string[]; // H.264, H.265, ProRes, ALL-I
		bitRate?: string; // 400 Mbps
		colorSampling?: string; // 4:2:2, 4:2:0
		bitDepth?: string; // 8-bit, 10-bit, 12-bit
		logProfile?: string; // S-Log3, V-Log, C-Log
		hdr?: boolean;
		timelapseBuiltIn?: boolean;
		externalRecording?: boolean;
		hdmiOutput?: string; // 4:2:2 10-bit
	};
	display: {
		type: string; // LCD, OLED, AMOLED
		size: string; // 3.2", 3.0"
		resolution: string; // 2.1M dots
		touchscreen: boolean;
		articulating: boolean; // Vari-angle, Tilting, Fixed
		articulationType?: string;
		viewfinder: boolean;
		viewfinderType?: string; // OLED, LCD
		viewfinderResolution?: string;
		viewfinderMagnification?: string;
		viewfinderCoverage?: string; // 100%
	};
	burstMode: {
		maxFps: number; // 20 fps, 30 fps
		bufferDepth?: string; // RAW, JPEG
		electronicShutter?: boolean;
		mechanicalShutter?: boolean;
		shutterSpeed: string; // 1/8000s
		bulbMode?: boolean;
	};
	lens: {
		mount: string; // E-mount, RF, Z, L, MFT
		included?: string;
		interchangeable: boolean;
		focalLength?: string; // For fixed lens cameras
		aperture?: string; // f/2.8, f/1.4-2.8
		opticalZoom?: string;
		digitalZoom?: string;
	};
	storage: {
		slots: number;
		types: string[]; // SD, CFexpress Type A, CFexpress Type B, microSD
		dualSlotRecording?: boolean;
		uhs?: string; // UHS-I, UHS-II
	};
	connectivity: {
		wifi: boolean;
		bluetooth: boolean;
		nfc?: boolean;
		usb: string; // USB-C, USB 3.2 Gen 2, micro-USB
		hdmi: boolean;
		hdmiType?: string; // micro HDMI, full HDMI
		microphone: boolean;
		microphoneType?: string; // 3.5mm jack
		headphone: boolean;
		remote?: boolean;
		ethernet?: boolean;
		timecode?: boolean;
	};
	battery: {
		type: string; // NP-FZ100, LP-E6NH
		capacity: string; // 2280 mAh
		shotsPerCharge?: number; // CIPA rating
		videoRuntime?: string;
		usbCharging: boolean;
		batteryGrip?: boolean;
	};
	build: {
		weatherSealing: boolean;
		material: string; // Magnesium alloy, Polycarbonate, Aluminum
		dimensions: string; // 126.9 x 95.1 x 73.7 mm
		weight: string; // 650g (body only)
		bodyOnly?: string; // weight
		withLens?: string; // weight
		tripodMount: boolean;
		coldShoeMount?: boolean;
		hotShoeMount?: boolean;
	};
	features: {
		rawCapture: boolean;
		rawFormat?: string; // ARW, CR3, NEF, ORF
		jpeg: boolean;
		heif?: boolean;
		bracketing?: boolean;
		hdr?: boolean;
		panorama?: boolean;
		multipleExposure?: boolean;
		intervalShooting?: boolean;
		bulbTimer?: boolean;
		gps?: boolean;
		waterproof?: boolean;
		waterproofDepth?: string; // 10m, 60m
		shockproof?: boolean;
		freezeproof?: boolean;
		dustproof?: boolean;
		builtInNdFilter?: boolean;
		ndFilterStops?: string;
		voiceControl?: boolean;
		touchscreenGestures?: boolean;
	};
	audio: {
		builtInMicrophone: boolean;
		microphoneType?: string; // Stereo, Mono
		externalMicSupport: boolean;
		windNoiseReduction?: boolean;
		audioLevels?: boolean;
		headphoneMonitoring?: boolean;
		audioFormat?: string[]; // AAC, LPCM
	};
	ratings: {
		costBenefit: number | null;
		imageQuality: number;
		videoQuality: number;
		autofocus: number;
		buildQuality: number;
		versatility: number;
	};
	targetAudience?: string; // Vlogger, Professional, Action Sports, Beginner
	manufacturer?: string;
	versions?: string[];
}

export interface Cafeteira extends BaseProduct {
	category: "cafeteiras";
	specs: CafeteiraSpecs;
}

export interface CafeteiraSpecs {
	manufacturer:
		| "3 Corações"
		| "Nespresso"
		| "Dolce Gusto"
		| "Oster"
		| "Philips"
		| "Arno"
		| "Black+Decker"
		| "Electrolux"
		| "Mondial"
		| "Cadence"
		| "Eletrolux"
		| "Philco"
		| "Britânia"
		| "Hamilton Beach"
		| "Cuisinart"
		| "De'Longhi"
		| "Breville"
		| "Mr. Coffee"
		| "Keurig"
		| "Outros";
	type:
		| "Espresso"
		| "Expresso Automática"
		| "Expresso Manual"
		| "Filtro"
		| "Italiana"
		| "Prensa Francesa"
		| "Cápsulas"
		| "Coado"
		| "Superautomática"
		| "Semi-automática";
	technology: "Automática" | "Manual" | "Semi-automática" | "Superautomática" | "Tradicional";
	powerSource: "Corrente doméstica" | "Bateria" | "Manual";
	capacity: {
		water: string;
		cups: number;
		grains?: string;
	};
	power: {
		watts: number;
		voltage: "110V" | "220V" | "Bivolt";
	};
	pressure: {
		bar: number;
		hasPressure: boolean;
	};
	filters: {
		type: "Permanente" | "Papel" | "Cápsula" | "Nenhum";
		washable: boolean;
		replacement?: string;
	};
	beverages: {
		recommended: string[];
		capsuleCompatible: boolean;
		compatibleCapsules?: string[];
	};
	brewing: {
		preparationTime: string;
		temperature?: {
			min: number;
			max: number;
		};
		cupCapacity: number;
		hasDoubleFaucet: boolean;
	};
	features: {
		hasTimer: boolean;
		hasSteamFunction: boolean;
		hasAntiDrip: boolean;
		hasCupWarmer: boolean;
		hasWaterIndicator: boolean;
		hasAutoClean: boolean;
		hasTemperatureControl: boolean;
		hasDigitalDisplay: boolean;
		hasMilkFrother: boolean;
		hasGrinder: boolean;
		grinderType?: "Cônico" | "Plano" | "Lâminas";
		grinderLevels?: number;
		hasKeepWarm: boolean;
		keepWarmTime?: string;
		hasProgrammableStart: boolean;
		hasStrengthControl: boolean;
		strengthLevels?: number;
		hasAutoShutoff: boolean;
		autoShutoffTime?: string;
		hasWaterFilter: boolean;
		hasDescalingAlert: boolean;
	};
	design: {
		materials: string[];
		color: string;
		coffeeType: "Cápsulas monodose" | "Pó" | "Grãos" | "Ambos";
		isPortable: boolean;
		isBuiltIn: boolean;
		hasRemovableDripTray: boolean;
		hasRemovableWaterTank: boolean;
		waterTankPosition?: "Traseira" | "Lateral" | "Superior";
	};
	dimensions: {
		width: string;
		depth: string;
		height: string;
		weight: string;
	};
	accessories: {
		included: string[];
		interchangeablePanels: boolean;
		hasRemovableDripTray: boolean;
		hasMeasuringSpoon: boolean;
		hasReusableFilter: boolean;
		numberOfCups?: number;
		hasMilkContainer?: boolean;
	};
	electrical: {
		voltage: "110V" | "220V" | "Bivolt";
		frequency: string;
		powerConsumption: string;
		includesBatteries: boolean;
		cableLength?: string;
	};
	maintenance: {
		cleaningFrequency: string;
		descalingFrequency?: string;
		filterReplacement?: string;
		hasRemovableParts: boolean;
		dishwasherSafeParts?: string[];
	};
	certifications: {
		inmetro: boolean;
		anatel?: boolean;
		other?: string[];
	};
	warranty: {
		general: string;
		parts?: string;
		conditions?: string[];
	};
	compatibility: {
		capsuleBrands?: string[];
		cupSizes?: string[];
		coffeeTypes: string[];
	};
	ratings: {
		costBenefit: number | null;
		brewingQuality: number;
		easeOfUse: number;
		easeCleaning: number;
		durability: number;
		features: number;
		design: number;
	};
}

export interface FoneDeOuvido extends BaseProduct {
	category: "fones-de-ouvido";
	specs: FoneDeOuvidoSpecs;
}

export interface FoneDeOuvidoSpecs {
	driverSize?: string;
	frequencyResponse?: string;
	sensitivityDb?: number | null;
	bluetoothCodecs?: string;
	bluetoothVersion?: string;
	wirelessRangeMeters?: number | null;
	connectors?: string;
	twsTechnology?: boolean;
	anc?: boolean;
	transparency?: boolean;
	batteryEarbuds?: string;
	batteryCase?: string;
	totalBattery?: string;
	batteryCapacityEarbudsMah?: number | null;
	batteryCapacityCaseMah?: number | null;
	chargingTimeEarbuds?: string;
	chargingTimeCase?: string;
	fastCharging?: boolean;
	wirelessCharging?: boolean;
	includesChargingCase?: boolean;
	microphone?: boolean;
	microphonesCount?: number | null;
	handsFreeMode?: boolean;
	detachableMic?: boolean;
	flexibleMic?: boolean;
	micOrientation?: string;
	waterResistance?: boolean;
	waterproof?: boolean;
	dustResistance?: boolean;
	ipRating?: string;
	formFactor?: string;
	monaural?: boolean;
	weight?: string;
	touchControls?: boolean;
	ledLight?: boolean;
	proximitySensor?: boolean;
	voiceAssistant?: boolean;
	integratedAssistants?: string;
	multipoint?: boolean;
	appSupport?: boolean;
	mp3Player?: boolean;
	fmRadio?: boolean;
	recommendedUse?: string;
	compatibleConsoles?: string;
	cableLength?: string;
	kids?: boolean;
	accessoriesIncluded?: string;
	ratings: {
		costBenefit: number | null;
		soundQuality: number;
		anc: number;
		comfort: number;
		battery: number;
	};
}

export interface Smartphone extends BaseProduct {
	category: "smartphones";
	specs: SmartphoneSpecs;
}

export interface SmartphoneSpecs {
	display: {
		size: string;
		resolution: string;
		resolutionType?: string;
		type: string;
		screenType?: string;
		refreshRate?: string;
		ppi?: number;
		maxBrightness?: string;
		touchscreen: boolean;
		foldable?: boolean;
		secondaryTouchscreen?: boolean;
		screenRatio?: string;
	};
	processor: string;
	processorSpeed?: string;
	processorCores?: number;
	cpuModels?: string;
	chipset: string;
	gpu: string;
	gpuSpeed?: string;
	ram: string;
	storage: string;
	memoryCardSlot?: boolean;
	battery: {
		capacity: string;
		type: string;
		fastCharging: boolean;
		wirelessCharging?: boolean;
		removable?: boolean;
		batteryTalkTime?: string;
	};
	camera: {
		main: string;
		mainCameras?: string[];
		mainAperture?: string | string[];
		mainTypes?: string[];
		mainQuantity?: number;
		front: string;
		frontCameras?: string[];
		frontAperture?: string;
		frontTypes?: string[];
		frontQuantity?: number;
		videoResolutionRear?: string;
		videoResolutionFront?: string;
		opticalZoom?: string;
		digitalZoom?: string;
		features?: string[];
		frontFlash?: boolean;
		wideAngleResolution?: string;
	};
	os: string;
	osVersion?: string;
	osLatestVersion?: string;
	osEdition?: string;
	osCustomLayer?: string;
	latestCustomLayer?: string;
	dimensions: string;
	weight: string;
	waterResistance: boolean;
	ipRating?: string;
	splashResistant?: boolean;
	dustResistant?: boolean;
	dropResistant?: boolean;
	waterproof?: boolean;
	simCard: string;
	dualSim: boolean;
	simSlots?: number;
	esimSupport?: boolean;
	esimQuantity?: number;
	simCardSizes?: string[];
	network: {
		gsm?: string;
		hspa?: boolean;
		lte?: boolean;
		fiveG: boolean;
	};
	connectivity: {
		usb: string;
		usbConnector?: boolean;
		jackConnector?: boolean;
		nfc: boolean;
		gps: string;
		wifi: boolean;
		bluetooth: boolean;
		miniHdmi?: boolean;
		radio?: boolean;
		tvTuner?: boolean;
	};
	sensors: {
		accelerometer: boolean;
		proximity: boolean;
		gyroscope: boolean;
		compass: boolean;
		barometer: boolean;
		fingerprint: boolean;
		facialRecognition?: boolean;
		irisRecognition?: boolean;
		heartRate?: boolean;
		noiseCancellation?: boolean;
	};
	features: {
		fmRadio?: boolean;
		tv?: boolean;
		vibration?: boolean;
		speakerphone?: boolean;
		wifiDirect?: boolean;
		wifiHotspot?: boolean;
		usbOtg?: boolean;
		qwertyKeyboard?: boolean;
		sosButton?: boolean;
		gamingPhone?: boolean;
		ruggedPhone?: boolean;
		includesPen?: boolean;
	};
	ratings: {
		costBenefit: number | null;
		hardware: number;
		display: number;
		camera: number;
		performance: number;
	};
	versions?: string[];
	manufacturer?: string;
}

export interface Smartwatch extends BaseProduct {
	category: "smartwatches";
	specs: SmartwatchSpecs;
}

export interface SmartwatchSpecs {
	display: {
		size: string;
		resolution?: string;
		type: string;
		alwaysOn?: boolean;
	};
	processor?: string;
	ram: string;
	storage: string;
	os?: string;
	compatibility: string;
	batteryLife: string;
	waterResistance: string;
	waterResistanceDepth?: string;
	dimensions?: string;
	weight?: string;
	case: {
		size: string;
		material: string;
		color?: string;
	};
	bezel: {
		material: string;
		color?: string;
	};
	strap: {
		material: string;
		color?: string;
		type: string;
	};
	sensors: {
		heartRate: boolean;
		spo2: boolean;
		gps: boolean;
		altimeter?: boolean;
		compass?: boolean;
		accelerometer?: boolean;
		gyroscope?: boolean;
		ecg: boolean;
		temperature?: boolean;
		bloodPressure?: boolean;
	};
	features: {
		calls: boolean;
		music: boolean;
		nfc: boolean;
		voiceAssistant: boolean;
		sleepTracking: boolean;
		stressMonitoring?: boolean;
		cameraControl?: boolean;
		calculator?: boolean;
		calendar?: boolean;
		findDevice?: boolean;
		chatGPT?: boolean;
		dynamicIsland?: boolean;
		sportsMode?: boolean;
		calorieTracking?: boolean;
		textReplies?: boolean;
		audioReplies?: boolean;
	};
	connectivity: {
		bluetooth: string;
		wifi: boolean;
		cellular: boolean;
	};
	languages?: string[];
	accessories?: string[];
	isKids?: boolean;
	isSmartband?: boolean;
	version?: string;
	ratings: {
		costBenefit: number | null;
		display: number;
		healthFeatures: number;
		battery: number;
		fitness: number;
	};
}

export interface Tablet extends BaseProduct {
	category: "smartphones";
	specs: TabletSpecs;
}

export interface TabletSpecs {
	display: {
		size: string;
		resolution: string;
		type: string;
		refreshRate: string;
		height?: string;
		width?: string;
		maxResolution?: string;
		ppi?: number;
		multiTouch?: boolean;
	};
	processor: string;
	chipset: string;
	ram: string;
	storage: string;
	expandableStorage: boolean;
	memoryCardTypes?: string[];
	maxMemorySupported?: string;
	memorySpeed?: number;
	battery: {
		capacity: string;
		type: string;
		duration?: string;
	};
	camera: {
		main: string;
		mainResolution?: string;
		mainQuantity?: number;
		front: string;
		frontResolution?: string;
		frontQuantity?: number;
		videoResolution?: string;
		flash?: boolean;
	};
	os: string;
	osVersion?: string;
	osCustomization?: string;
	dimensions: string;
	depth?: string;
	height?: string;
	width?: string;
	weight: string;
	connectivity: {
		wifi: string;
		bluetooth: string;
		bluetoothVersion?: string;
		cellular: boolean;
		usb: string;
		simCardReader?: string;
		dualSim?: boolean;
		gps?: boolean;
		headphoneJack?: boolean;
		microphone?: boolean;
	};
	stylusSupport: boolean;
	keyboardSupport: boolean;
	speakers: string;
	processor_details?: {
		cores?: number;
		speed?: number;
		graphicProcessor?: string;
	};
	sensors?: string[];
	security?: {
		facialUnlock?: boolean;
		parentalControl?: boolean;
	};
	accessories?: string[];
	ratings: {
		costBenefit: number | null;
		display: number;
		performance: number;
		battery: number;
		productivity: number;
	};
}

export interface Notebook extends BaseProduct {
	category: "notebooks";
	specs: NotebookSpecs;
}

export interface NotebookSpecs {
	display: {
		size: string;
		resolution: string;
		type: string;
		refreshRate: string;
		touchscreen: boolean;
		retina?: boolean;
		antiGlare?: boolean;
		panelType?: string;
		colorGamut?: string;
		aspectRatio?: string;
	};
	processor: string;
	processorBrand?: string;
	processorLine?: string;
	processorModel?: string;
	processorMaxSpeed?: string;
	processorCores?: number;
	chipset: string | null;
	gpu: string;
	gpuBrand?: string;
	gpuLine?: string;
	gpuModel?: string;
	integratedGpu?: {
		brand?: string;
		line?: string;
		model?: string;
	};
	dedicatedGpu?: {
		brand?: string;
		line?: string;
		model?: string;
		memory?: string;
		memoryType?: string;
	};
	ram: string;
	ramSpeed?: string;
	ramType?: string;
	maxRamSupported?: string;
	ramSlots?: number;
	storage: string;
	storageType: string;
	ssdInterface?: string;
	m2StorageCapacity?: string;
	expandableStorage: boolean;
	battery: {
		capacity: string | null;
		type: string;
		duration?: string | null;
	};
	os: string;
	osVersion?: string;
	osEdition?: string;
	dimensions: string;
	width?: string;
	depth?: string;
	height?: string;
	weight: string;
	keyboard: {
		backlit: boolean;
		numpad: boolean;
		type: string;
		language?: string;
	};
	webcam: {
		resolution: string;
		privacy: boolean;
	};
	audio: {
		speakers: string;
		speakerCount?: number;
		microphoneQuality: string;
		soundModes?: string | null;
	};
	connectivity: {
		wifi: string;
		bluetooth: string;
		ethernet: boolean;
		usb: string;
		hdmi: boolean;
		thunderbolt: boolean;
		sdCardReader: boolean;
		headphoneJack?: boolean;
		videoPortTypes?: string;
	};
	ports: string;
	coolingSystem: string | null;
	fingerprint: boolean;
	material?: string;
	manufacturer?: string;
	includedAccessories?: string;
	optimizedForAI?: boolean;
	ratings: {
		costBenefit: number | null;
		performance: number;
		display: number;
		battery: number;
		portability: number;
	};
}

export interface Smartv extends BaseProduct {
	category: "smart-tvs";
	specs: SmartvSpecs;
}

export const SMARTV_CATEGORY = "smart-tvs" as const;

export interface SmartvSpecs {
	screen: {
		sizeInches: number;
		resolution: "HD" | "Full HD" | "4K" | "8K";
		panelType: "LED" | "QLED" | "OLED" | "Mini LED";
		hdr?: boolean;
		refreshRateHz?: number;
		brightnessNits?: number;
		contrastRatio?: number;
		responseTimeMs?: number;
		viewingAngleDegrees?: number;
		aspectRatio?: string;
	};

	system: {
		os: string;
		apps?: string[];
		voiceAssistant?: string;
		isSmart: true;
		storageGb?: number;
		processorCores?: number;
		screenShare?: boolean;
	};

	audio: {
		speakers?: number;
		powerWatts?: number;
		dolbyAudio?: boolean;
		surround?: boolean;
	};

	connectivity: {
		wifi: boolean;
		bluetooth?: boolean;
		ethernet?: boolean;
	};

	ports: {
		hdmi: number;
		usb?: number;
		spdif?: boolean;
		component?: boolean;
		composite?: boolean;
		rfAntenna?: boolean;
		vga?: boolean;
	};

	design?: {
		vesa?: boolean;
		widthCm?: number;
		heightCm?: number;
		depthCm?: number;
		weightKg?: number;
		cableManagement?: boolean;
	};

	energy?: {
		energyEfficiencyClass?: string;
		inmetroCertification?: string;
	};

	ratings: {
		costBenefit: number | null;
		imageQuality: number;
		soundQuality: number;
		systemSpeed: number;
		connectivity: number;
	};
}
