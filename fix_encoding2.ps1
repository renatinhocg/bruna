$bytes = [System.IO.File]::ReadAllBytes('e:\Bruna\frontend\src\pages\LandingPage.jsx')
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

$fixes = @(
    @("?f???", "?"),
    @("?f???tica", "pratica"),
    @("?f?s", "as"),
    @("alcan?f?ar", "alcancar"),
    @("alian?f?as", "aliancas"),
    @("aspira?f??f?es", "aspiracoes"),
    @("atrav?f?s", "atraves"),
    @("avan?f?a", "avanca"),
    @("Bot?f?o", "Botao"),
    @("bot?f?o", "botao"),
    @("cient?f?ficas", "cientificas"),
    @("confian?f?a", "confianca"),
    @("Cont?f?nuo", "Continuo"),
    @("cont?f?nuo", "continuo"),
    @("conviv?f?ncia", "convivencia"),
    @("cr?f?tico", "critico"),
    @("Cr?f?tico", "Critico"),
    @("desenvolv?f?amos", "desenvolvessemos"),
    @("emp?f?tica", "empatica"),
    @("equil?f?brio", "equilibrio"),
    @("espa?f?o", "espaco"),
    @("Espa?f?o", "Espaco"),
    @("Est?f?cio", "Estacio"),
    @("est?f?mulo", "estimulo"),
    @("excel?f?ncia", "excelencia"),
    @("Excel?f?ncia", "Excelencia"),
    @("hist?f?rias", "historias"),
    @("Hist?f?rias", "Historias"),
    @("Informa?f??f?es", "Informacoes"),
    @("informa?f??f?es", "informacoes"),
    @("L?f?deres", "Lideres"),
    @("l?f?deres", "lideres"),
    @("m?f?dio", "medio"),
    @("M?f?dio", "Medio"),
    @("m?f?scara", "mascara"),
    @("m?f?todo", "metodo"),
    @("M?f?todo", "Metodo"),
    @("mensur?f?veis", "mensuráveis"),
    @("n?f?mero", "numero"),
    @("N?f?mero", "Numero"),
    @("ningu?f?m", "ninguem"),
    @("orienta?f??f?es", "orientacoes"),
    @("Orienta?f??f?es", "Orientacoes"),
    @("Patr?f?cia", "Patricia"),
    @("patr?f?cia", "patricia"),
    @("prop?f?sito", "proposito"),
    @("Prop?f?sito", "Proposito"),
    @("refer?f?ncia", "referencia"),
    @("Refer?f?ncia", "Referencia"),
    @("resili?f?ncia", "resiliencia"),
    @("Resili?f?ncia", "Resiliencia"),
    @("S?f?cia", "Socia"),
    @("s?f?cia", "socia"),
    @("Sele?f??f?o", "Selecao"),
    @("sele?f??f?o", "selecao"),
    @("situa?f??f?es", "situacoes"),
    @("Solu?f??f?es", "Solucoes"),
    @("solu?f??f?es", "solucoes"),
    @("t?f?cnicas", "tecnicas"),
    @("T?f?cnicas", "Tecnicas"),
    @("Transpar?f?ncia", "Transparencia"),
    @("transpar?f?ncia", "transparencia"),
    @("voc?f?", "voce"),
    @("Voc?f?", "Voce"),
    @("n?f?o", "nao"),
    @("N?f?o", "Nao"),
    @("s?f?o", "sao"),
    @("S?f?o", "Sao"),
    @("est?f?o", "estao"),
    @("Est?f?o", "Estao"),
    @("Gest?f?o", "Gestao"),
    @("gest?f?o", "gestao"),
    @("carreir?f?", "carreira")
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

# Check remaining count
$remaining = ($content.Split("?f?")).Length - 1
Write-Host "Remaining ?f? count: $remaining"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText('e:\Bruna\frontend\src\pages\LandingPage.jsx', $content, $utf8NoBom)
Write-Host "Saved."
