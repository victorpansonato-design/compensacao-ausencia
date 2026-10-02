# Compensação de ausências · UniAnchieta

Protótipo funcional do novo fluxo de compensação de ausências. O princípio é o esforço mínimo para o aluno: ele informa as datas, anexa o documento e sai. A faculdade conduz o resto, com avisos no aplicativo e por e-mail.

> Todos os dados da demonstração são fictícios.

## Como abrir

- **No navegador:** baixe e abra o `index.html`. Funciona sem internet.
- **Online:** em *Settings › Pages*, escolha a branch `main` e a pasta `/ (root)`. O endereço será `https://victorpansonato-design.github.io/compensacao-ausencia/`.

## Os 5 cenários

Ficam na barra preta do topo e estão conectados: o que o aluno envia aparece para a coordenação, a aprovação libera as atividades para o professor e tudo volta para o aluno. O botão **Reiniciar** volta a demonstração ao início.

| Cenário | O que mostra |
|---|---|
| Aluno · até 14 dias | Envio do documento. As faltas são removidas automaticamente após a aprovação. |
| Aluno · 15 a 39 dias | Uma atividade por disciplina, entrega, segunda chance e faltas compensadas. |
| Aluno · 40 dias ou mais | Disciplinas entram automaticamente no Estudo Dirigido, sem custo. |
| Coordenação | Fila de documentos com duas ações: aprovar ou pedir ajuste. |
| Professor | Publicar a atividade e avaliar a entrega. Prazo e avisos são automáticos. |

## Regras usadas no protótipo

- **Documentos aceitos:** atestado médico, certidão de casamento do(a) aluno(a) nubente, certidão de serviço militar obrigatório e certidão de óbito de parente de 1º grau. Declarações de trabalho ou outras justificativas não previstas na legislação não são aceitas.
- **Até 14 dias:** faltas removidas automaticamente após a aprovação.
- **De 15 a 39 dias:** uma atividade por disciplina, com prazo de 15 dias após o fim do afastamento e segunda chance de 7 dias se a atividade não for aceita.
- **40 dias ou mais:** disciplinas no Estudo Dirigido, sem custo e sem inscrição.
- **Prova substitutiva:** pedida no Portal do Aluno, na Secretaria Virtual. Não faz parte deste sistema.
- O **Aviso Importante** do sistema atual abre ao entrar na área do aluno.

## Pontos para validação

- Prazo da segunda chance (7 dias no protótipo).
- Prazos da coordenação para analisar e do professor para publicar.
- Integração com o Lyceum para lançar a compensação e matricular no Estudo Dirigido.
- Se disciplinas de 40 dias ou mais podem ir para o Digital Especial.
- Texto do e-book em `docs/`, a conferir com as normas vigentes.

## Estrutura

```
index.html        protótipo pronto, um único arquivo
docs/             regulamento simples em PDF (também embutido no index.html)
src/              código-fonte: estilos, componentes, telas e texto do e-book
assets/logo.png   logo usada no protótipo
scripts/build.py  gera o index.html a partir de src/
```

Para editar e gerar de novo o `index.html`:

```bash
npm install
npm run build
```

O visual segue o Design System UniAnchieta 3.0, no perfil simples.
