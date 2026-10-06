/**
 * Synthetic page with the structure of a review post of the source site (same classes and nesting,
 * invented products and text), so tests never need the network or a copy of a real page.
 */
const product = (index: number, name: string, specs: [string, string][]) => `
<div class="wp-block-group titulo-numerado"><div class="wp-block-group__inner-container">
<h2 class="wp-block-heading">${name}</h2>
</div></div>
<div class="box-products">
	<div class="bp-image">
		<a class="link-afiliado" href="https://shop.example/item-${index}">
			<img src="https://m.media-amazon.com/images/I/photo-${index}._SS500_.jpg" loading="lazy" alt="${name}" />
		</a>
	</div>
	<div class="bp-title-price">
		<p class="bp-title">${name}</p>
		<div class="bp-description"><p>Texto de exemplo ${index} que nunca deve ir para o rascunho.</p></div>
	</div>
</div>
<div class="wp-block-group box-pro-contra"><div class="wp-block-columns">
	<div class="wp-block-column pros"><p><strong>Vantagens</strong></p>
		<ul class="wp-block-list"><li>Vantagem de exemplo ${index}</li><li>Outra vantagem</li></ul>
	</div>
	<div class="wp-block-column contras"><p><strong>Desvantagens</strong></p>
		<ul class="wp-block-list"><li>Desvantagem de exemplo ${index}</li></ul>
	</div>
</div></div>
<div class="wp-block-group box-ficha-tecnica"><div class="wp-block-column">
	<h3 class="wp-block-heading">Detalhes técnicos do ${name}</h3>
	<ul class="wp-block-list">
		${specs.map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`).join("\n\t\t")}
	</ul>
</div></div>`;

export const FIXTURE_URL = "https://eletrosinter.com.br/cozinha/torradeira-de-teste/";

export const FIXTURE_HTML = `<!doctype html>
<html lang="pt-BR">
<head><title>Melhor torradeira de teste: 9 opções</title></head>
<body>
<article>
	<h1>Melhor torradeira de teste: 9 opções para comprar</h1>
	<p class="resumo">Resumo de exemplo que nunca deve ir para o rascunho.</p>
	<p class="wp-block-paragraph">Parágrafo de abertura de exemplo.</p>
	<h2 class="wp-block-heading">Qual torradeira vale a pena?</h2>
	<div class="lr-container">
		<div class="lr-row"><div class="lr-title"><a href="https://shop.example/item-1">Marca Um T100</a></div></div>
	</div>
	${Array.from({ length: 9 }, (_, i) =>
		product(i + 1, i === 0 ? "Marca Um T100" : `Marca ${i + 1} T${i + 1}00`, [
			["Potência", `${700 + i * 50}W`],
			["Capacidade", `${2 + (i % 2) * 2} fatias`],
			["Dimensões (A x L x P)", `18 x 2${i} x 30cm`],
			...(i === 1 ? ([["Observação", "valor com {chaves} e <tag>"]] as [string, string][]) : []),
		]),
	).join("\n")}
	<div id="rank-math-faq" class="rank-math-block"><div class="rank-math-list">
		<div class="rank-math-list-item">
			<h2 class="rank-math-question">Pergunta de exemplo um?</h2>
			<div class="rank-math-answer"><p>Resposta de exemplo que nunca deve ir para o rascunho.</p></div>
		</div>
		<div class="rank-math-list-item">
			<h2 class="rank-math-question">Pergunta de exemplo dois?</h2>
			<div class="rank-math-answer"><p>Outra resposta de exemplo.</p></div>
		</div>
	</div></div>
</article>
</body>
</html>`;
