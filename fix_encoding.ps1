$bytes = [System.IO.File]::ReadAllBytes('e:\Bruna\frontend\src\pages\LandingPage.jsx')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# List of [bad, good] pairs
$fixes = @(
    @("?f? marca", "a marca"),
    @("azul m?f?dio", "azul medio"),
    @("Fecha o menu ap?f?s clicar", "Fecha o menu apos clicar"),
    @("Fiel ?f? marca", "fiel a marca"),
    @("ap?f?s", "apos"),
    @("Ap?f?s", "Apos"),
    @("n?f?o", "nao"),
    @("N?f?o", "Nao"),
    @("s?f?o", "sao"),
    @("S?f?o", "Sao"),
    @("Gest?f?o", "Gestao"),
    @("gest?f?o", "gestao"),
    @("atua?f??f?o", "atuacao"),
    @("Atua?f??f?o", "Atuacao"),
    @("transforma?f??f?o", "transformacao"),
    @("Transforma?f??f?o", "Transformacao"),
    @("solu?f??f?o", "solucao"),
    @("Solu?f??f?o", "Solucao"),
    @("forma?f??f?o", "formacao"),
    @("Forma?f??f?o", "Formacao"),
    @("cria?f??f?o", "criacao"),
    @("rela?f??f?o", "relacao"),
    @("Rela?f??f?o", "Relacao"),
    @("Dire?f??f?o", "Direcao"),
    @("dire?f??f?o", "direcao"),
    @("fun?f??f?o", "funcao"),
    @("Fun?f??f?o", "Funcao"),
    @("a?f??f?o", "acao"),
    @("A?f??f?o", "Acao"),
    @("inova?f??f?o", "inovacao"),
    @("opini?f?o", "opiniao"),
    @("miss?f?o", "missao"),
    @("Miss?f?o", "Missao"),
    @("vis?f?o", "visao"),
    @("Vis?f?o", "Visao"),
    @("vers?f?o", "versao"),
    @("sess?f?es", "sessoes"),
    @("Sess?f?es", "Sessoes"),
    @("sess?f?o", "sessao"),
    @("profiss?f?o", "profissao"),
    @("Profiss?f?o", "Profissao"),
    @("Quest?f?es", "Questoes"),
    @("n?f?vel", "nivel"),
    @("N?f?vel", "Nivel"),
    @("n?f?veis", "niveis"),
    @("poss?f?vel", "possivel"),
    @("Poss?f?vel", "Possivel"),
    @("imposs?f?vel", "impossivel"),
    @("dispon?f?vel", "disponivel"),
    @("Sens?f?vel", "Sensivel"),
    @("S?f?nior", "Senior"),
    @("s?f?nior", "senior"),
    @("Estrat?f?gica", "Estrategica"),
    @("estrat?f?gica", "estrategica"),
    @("Experi?f?ncia", "Experiencia"),
    @("experi?f?ncia", "experiencia"),
    @("compet?f?ncia", "competencia"),
    @("Compet?f?ncia", "Competencia"),
    @("consci?f?ncia", "consciencia"),
    @("ci?f?ncia", "ciencia"),
    @("h?f? mais", "ha mais"),
    @("j?f?", "ja"),
    @("J?f?", "Ja"),
    @("at?f?", "ate"),
    @("At?f?", "Ate"),
    @("servi?f?os", "servicos"),
    @("Servi?f?os", "Servicos"),
    @("organiza?f??f?es", "organizacoes"),
    @("organiza?f??f?o", "organizacao"),
    @("reflex?f?o", "reflexao"),
    @("Reflex?f?o", "Reflexao"),
    @("gratid?f?o", "gratidao"),
    @("Gratid?f?o", "Gratidao"),
    @("informa?f??f?o", "informacao"),
    @("negocia?f??f?o", "negociacao"),
    @("avalia?f??f?o", "avaliacao"),
    @("Avalia?f??f?o", "Avaliacao"),
    @("realiza?f??f?o", "realizacao"),
    @("Realiza?f??f?o", "Realizacao"),
    @("prepara?f??f?o", "preparacao"),
    @("parab?f?ns", "parabens"),
    @("Parab?f?ns", "Parabens"),
    @("?f?rea", "Area"),
    @("?f?reas", "Areas"),
    @("?f?timo", "otimo"),
    @("?f?tima", "otima"),
    @("?f?nico", "unico"),
    @("?f?nica", "unica"),
    @("?f?ltimo", "ultimo"),
    @("?f?ltimos", "ultimos"),
    @("?f?ltima", "ultima"),
    @("?f? BM", "(c) BM"),
    @("?f? 2025", "(c) 2025"),
    @("?f?xito", "exito"),
    @("?f? ", "a ")
)

$fixed = 0
foreach ($pair in $fixes) {
    $key = $pair[0]
    $val = $pair[1]
    while ($content.Contains($key)) {
        $content = $content.Replace($key, $val)
        $fixed++
    }
}
Write-Host "Made $fixed replacements"

$remaining = ($content.Split("?f?")).Length - 1
Write-Host "Remaining ?f? count: $remaining"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText('e:\Bruna\frontend\src\pages\LandingPage.jsx', $content, $utf8NoBom)
Write-Host "Saved."
