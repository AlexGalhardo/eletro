# Revisão dos rascunhos importados

Lista do que precisa de conferência humana antes de publicar os 514 rascunhos importados em 2026-11-10
(`webscrapping/batch.ts` + reescrita por Claude Haiku). Os textos usam só a ficha técnica de cada produto e
evitam citar os valores duvidosos abaixo, mas a ficha (`content/products/<slug>.json`) continua como veio da
origem. Ver [webscrapping-modelation.md](webscrapping-modelation.md) e [post-status.md](post-status.md).

## Antes de publicar um rascunho

- [ ] Trocar os links `"#"` pelos links de afiliado reais (ou apagar o campo).
- [ ] Conferir na fonte os dados marcados abaixo para os produtos do post.
- [ ] Revisar título e FAQ; mudar `draft` para `false`; rodar `bun run post-status`.

## Decisões de SEO pendentes

O título não usa a palavra-chave do slug porque a ficha não confirma o atributo. Confirmar o dado e devolver a
palavra ao título, ou manter assim:

- melhor-air-fryer-inox e melhor-fogao-inox sem "inox" no título (ficha não confirma inox). Decidir: confirmar material e devolver a palavra ao título, ou aceitar
- títulos sem "2 portas" (freezer) e sem "controle remoto" (ventilador): a ficha não confirma
- títulos sem "barato"/"custo-benefício" (freezer-barato, microondas-bom-e-barato, microondas-melhor-custo-beneficio): ficha sem preço
- melhor-depilador-a-laser tem título "Depilador IPL" (a ficha diz luz pulsada, não laser)
- melhor-geladeira-3-portas com título sem "3 portas" (ficha não informa portas)

## Fichas técnicas contraditórias ou suspeitas

Formato: post ou lote, seguido dos produtos e do problema (nome × ficha).

- melhor-sanduicheira-britania: Britânia Crome Inox 750W, ficha diz 850W
- melhor-cadeira-de-camping: BASK H00005 180kg, ficha diz até 150kg
- melhor-geladeira-barata: Consul CRM44AK 377 L no nome, ficha 386 L
- melhor-lavadora-de-alta-pressao-karcher: Compacta 1200W no nome, ficha 1400W
- melhor-frigobar-consul: só 6 produtos na lista
- melhor-ar-condicionado-9000-btus: 4 fichas com "120000 BTUs" (provável 12000)
- melhor-depurador-de-ar: Suggar DTH82PT 120W no nome, ficha 160W
- lote-07: ES5GB (nome 526 L, ficha 440 L); EEV300B (295 L x 268 L); Wolff Fio de Ouro (110 mL x 220 ml); PH900V (300 W x 250 W); Black+Decker 9036-BR (180 x 200 RPM); Cadence Pour Over (1,2 L x 1,25 L)
- lote-08: Mondial C-44-32X-SDI (1,28 L x 1,2 L); Oster OFRT790 temp. mínima 0°C; Brastemp BMO40AR 58 programas; Philco PAS26P reservatório 610L/200L, PAS56 200W, PAS4000V 2000W; Singer M3335 (23 x 100 pontos)
- melhor-frigobar-midea: faixa de temperatura "congelador até 10°C" / "0C a 10C"
- melhor-piscina-infantil: capacidades Intex (160 L, 45 L) não batem com as medidas
- melhor-depurador-eos: EPCO90ITD 110V/220V (demais 127V/220V)
- lote-09: Oster OCAF550 (1,5 L x 1,2 L); escadas de alumínio (alturas do nome x ficha); EOS ECG02 potência "1W – Térmica 3,9kW"; Mondial ERB-01 (1200W x 1300/1000W); Ninja Blast Portátil (700W x 1000W), Blast Max "Potência 11,1V", SS151 sem potência, BN801 com U+200E no nome; Sokany LG-SK71-2 (350 x 300 mL); Mondial VSP-30-B e VSP-30-AP com medidas idênticas
- lote-10: WAP Barbecue Digital (1700W x 1800/1700W); air-fryer-com-visor (2 modelos sem visor na ficha); Luatek 21V "bivolt"; Bosch GHP 220 (2000 x 2200 psi); Philips HR7304/92 (750 x 1000W), DXG BM-F3312 (500 x 400W); Vonder MRV-115 2,7x0,9x0,7cm com 764g, MBV-036 "Potência 3,6V"; Exbon PRO-CKE6800 3g; HQ-310RDF mecânico e eletrônico; HQ-480SBSFFK 52,32kWh/mês
- lote-11: Panasonic NR-BT56PD4XA (435 x 387 L), NB-BB65GV7BA (prefixo NB?), Prime Freeze x "extra-frio: não"; Electrolux EAF50 (1800 x 1700W); Brastemp BMO40AR (1500 x 900W); HQ-130FBPVL "5 a 12°C" e termostato 0–5; Infanti Flux 0 a 4,5 anos com 15kg; WAP Grand Family duplicado; Powermaid/Powemaid
- lote-12: Walita RI2244/90 (1200 x 1400W); motosserras (polegadas do nome x sabre); Oster Perfect Brew 1700W 127V / 2000W 220V; Oster Multi Touch 0ºC; casinhas Beethoven N5 com mesmo código e medidas diferentes; DIGIMESS 0,01mm/.0005″; Waterpik WP100B (130 x 600 mL); Ou Trium 46+4L x 46L; Vonder VD050 ±0,2mm; Mondial BG-03 5 pentes x 4 tamanhos; Tron 51.01-1145 sem medidas
- lote-13: Mondial ES-01-IR (1300 x 1200W); AFO-25L-BI (2200 x 2000W); Arno AFI6 (2000 x 1735/1835W); Thermos F410 (340 x 355 mL), Buba (325 x 320 mL); Philco Travel Shine 2750W 220V; liquidificadores Mondial "San Cristal" x jarra de plástico; Mondial CH-06 89x66x49cm; Bosch GLM 50-12 dimensões com 4 valores; Britânia BVT301 mesa x mesa/parede
- lote-14: Natura Essencial Oud em feminino e masculino; Relaxshop Foot Massager duplicado; cafeteira-programavel mistura coadas e expressos, EP1220 classificada diferente em 2 listas; Suggar Neo Glass 5 bocas com 3 potências; fogões industriais "com forno" sem capacidade; coqueteleiras (ml do nome x ficha); Oster OCAF300 (750 x 700 ml); NF20 (180 x 185 L), Midea MDRC564FZD013 = medidas do Consul CHB53MB; Vonder LAV 1300 só psi; Burigotto Prima "a partir 0 meses"
- lote-15: Atlas Mônaco Plus 4 bocas x 5 queimadores; Britânia Juicer 700 manual com 400W; Nadir Aruba (475 x 465 ml); Tramontina 13460351 medidas; Venâncio BR6BFPR sem capacidade do forno; Lorenzetti Duo Shower Quadra 40kPa (outros 400kPa); Aiebao canguru 36kg e "isopor"; Ruvolo Stella Artois material/capacidade ambíguos; WAP WJ1200 4,36kg
- lote-16: Arno LN87 (2200 x 1400W); Mondial FRN-52-B com medidas diferentes em 2 listas; Philco PFE65 = PFE52P; Philco PFR15PG (4,4 x 4,3 L); colchão inflável em "cm" impossível; chuveiros Fame potências repetidas; Brastemp BLF08 25 L/ciclo; Rochedo 6 L 410g; IRWIN = Stanley 33027; Black Tools TCB21B "3000mAh" como potência; serras de poda com unidades misturadas; pipoqueiras Loreto = Ravena; escovas EA-JU-03 = EA-07; 3 Corações LOV = LOV Premium; carrinhos com dimensões "1,06"
- lote-18: Rayovac DIY3AAABC (250 x 300 lúmens); Makita DML802 = DML815; Imbera EVZ21 (560 x 561 L, é 3 em 1); Eos EFV70 110V; Antares = NTK Ice Box (medidas); Coleman 316 material diferente em 2 listas; Cebrace Doaf espessura 4 x 3mm e "orgánico"; EOS ELL08S 08 x 10 serviços; Lorenzetti Ducha Relax potência ambígua; Fame Intense "5400" sem unidade
- lote-17: bolsas térmicas com capacidade maior que o volume externo; Cadence LIQ351 (2,1 x 2,2 L); Bialetti 800 x 810ml; Luatek LT-400 (500 x 2000 lúmens); Philco PHP500 (4 x 4,5 L); Philco PLS11T 11 x 10kg; sacos de dormir faixa do nome x ficha; LG ar portátil com 2 códigos no nome; Electrolux PE12G 5 L/h; IBBL E-Due "nível 7"; Mondial CTG-01 medidas diferentes em 2 listas; DoceLar Torino 7/8″; Oral-B Kid's sem dados
- lote-19: DefQualL LF-2028VA (350 x 1000 lúmens); Oster OTOP100 37,50kWh; Elgin 42FOG0201000 64x43x23cm com 1,2kg; GOKOCO GD033 (1400 x 1300W); Elgin 42AFG3501000 110V; Ecooda EC6272 20W para 100 lúmens; Nokta SX28 5 m; Mor Churras To Go largura 4,8cm; NTK Frontier Flex butano/propano x só butano
- lote-20: São João Classic 59.400-8 (8 x 6 L); Philco PSA3250 (2100 x 2200W); Philco PCT12P 2000W x 1300W em 2 listas; "Xiaomi Robot Vcauum S40 Pro"; torneira-com-filtro sem filtragem na ficha
- lote-21: Philco PCT12P (1300 x 2100W); Oster OTOP402 (600 x 6000W); Mondial B-23-NP (4 e 2,3 x 4,5 L); Britânia Multipane (550 x 650W); Cadence FRT430 (4,1 x 4,2 L); esteiras com "13hm/h", "40 x 1,22cm" e categoria cuidados-pessoais; Braslar Asiatico Junior sem forno; luminárias com efeitos em "temperatura de cor"; EOS EFB50 -2 a 2°C; aquecedor-de-agua-lorenzetti lista torneiras
- lote-22: Consul CHA14AB "freezer" com mínima 7°C; Silent Noronha e Sestini Waves 20 com medidas/peso/trava diferentes em 2 listas; malas "Capacidade 10kg"; Panasonic NN-ST55LMRUN (1270 x 800W); Philco PMO28E (1400 x 1100W); LIZZE Extreme "127V ou 220V (voltagem única)"; Electrolux IM8B (590 x 596 L), IS4S (435 x 440 L); NAP TRB10 capa; Philco PBT450P 0,88 cm
- lote-23: Meta Parts X11 (120 x 140kg), WCT (140 x 120kg); Mueller Decorato potências; Electrolux TF39 (310 x 315 L); consumo em "kW/h"; DC35A extra-frio x Super Freezer, peso 44,5 x 49kg; copos Pacco sem tampa com conservação; piscina Mor 3700 L x medidas; torradeiras "voltagem única" com 2 valores; WAP FW009548 (2000 x 1800W); Hamilton Beach 80393-BZ127 voltagem
- lote-26: GOKOCO GD032/GD033/GD029 potência do nome x ficha, GD031 "bivolt ou 127V"; HQ-400CF2DX1 = HQ-400CFX; Suggar FG0422VC 29x52x7cm; rótulo "Recuros extras" (liquidificadores)
- lote-final: WAP Air Fresh 90W parece climatizador; WAP Rajada Pro 60 com 55cm; Britânia BFE49 (2000W x 1500/2000W), BFE55P = BFE49 em peso e medidas; Vonder "vídea"
- lote-24: growlers (1,5 x 1,54 L; 60oz x 1,7 L); Electrolux IM8S (590 x 596 L); Stanley 354 x 345 mL; HQ-95FBPV tipo diferente em 2 listas; Metalfrio VB28 "188,6 x 52,5 x 62,2m"; Black+Decker "Potência 5,4Wh" e "20V"; Fast Gourmet 1QD-582 sem potência; Mor Summer 2105 = 2490
- lote-25: Black+Decker BD40K4 (320 x 360 RPM); Electrolux ESG20 medidas em ordem trocada; Wesco "m/mim"; air-fryer-5-litros com modelos de 5,5 a 5,6 L; PN10X sem vazão e tensão

## Posts da origem que não foram importados

- Fotos no CDN da Magalu (`a-static.mlcdn.com.br`), que responde 403 a robôs: lava-louças, maçarico culinário,
  depurador de ar 80cm, máquina de água com gás, máquina de tosar cachorro, geladeira Hisense, lixeira com rodas,
  motosserra a bateria, brinquedos Freso, aspirador Midea, jogo de xícaras, lanterna para pesca, frigobar Philco,
  fogão 4 bocas barato.
- Layout que o parser não entende: batedeira, cafeteira expresso, fogões 4 e 5 bocas.
- Foto na Shopee ou sem foto: robô aspirador Dreame, parafusadeira Black Tools.
- Entidade HTML inválida no nome de produto: geladeiras Electrolux.
- Os mesmos itens podem ser importados à mão em `/admin/import` com outra foto, ou de novo pelo lote depois de
  ajustar o parser.
