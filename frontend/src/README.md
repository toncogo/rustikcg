# RustikCG — Área do Cliente

## Páginas
- `index.html` — homepage original, com o botão **PAINEL** apontando para o login.
- `login.html` — tela de autenticação com identidade visual rústica.
- `perfil.html` — painel do cliente com sidebar, perfil, configurações e histórico.

## Fluxo do protótipo
1. Abra `index.html`.
2. Clique em **PAINEL**.
3. Em `login.html`, informe um e-mail válido e uma senha com pelo menos 4 caracteres.
4. O formulário redireciona para `perfil.html`.

> O login atual é apenas front-end para demonstrar navegação e layout. Para produção, conecte o formulário a uma API/backend e implemente autenticação segura no servidor.

## Perfil
O painel inclui os campos:
- Nome completo
- Idade
- Cidade
- Estado
- E-mail
- Telefone
- Profissão
- Endereço
- Número
- CEP
- Complemento

O botão **EDITAR PERFIL** habilita os campos e exibe as ações de salvar/cancelar.
