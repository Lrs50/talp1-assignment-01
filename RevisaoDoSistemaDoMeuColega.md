# Aluno avaliado: Nathalia Fernanda de Araújo Barbosa

---

## Pergunta 1: Funcionalidades Solicitadas

De forma geral, o sistema atende aos requisitos especificados. As funcionalidades principais foram implementadas de maneira clara, incluindo gerenciamento de questões, criação e gerenciamento de provas, geração de PDFs e correção com dois modos distintos.

Os fluxos principais funcionam bem e os testes end-to-end indicam que o sistema está operacional nos cenários básicos. A interface é um dos pontos mais fortes, sendo intuitiva e amigável, especialmente na criação de questões.

Como pontos de melhoria, o botão de exportação de correções não funcionou durante os testes. Além disso, algumas validações importantes não estão cobertas, como entradas de CSV ou campos vazios. A geração de PDFs funciona, porém não há testes que validem o conteúdo gerado, como cabeçalho, rodapé e dados do aluno. Também não há verificação nos testes sobre variações na ordem das questões entre versões.

No geral, o sistema cumpre bem o que foi proposto, com espaço para melhorias em validação e testes.

---

## Pergunta 2: Problemas de Qualidade do Código e Testes

O código apresenta uma boa base estrutural. Há uso de TypeScript com tipagem definida, separação de responsabilidades e validações em alguns pontos da API.

Por outro lado, existem aspectos que podem ser melhorados. O CorrectionService é mais complexo do que o necessário, o que dificulta a leitura e manutenção. O parser de CSV é manual e pode ser mais robusto. Há inconsistências de nomenclatura, mistura de português e inglês e diferenças entre estilos como snake_case e camelCase. Também há uso de JSON stringify e parse sem validação, presença de valores fixos sem explicação, e o algoritmo de embaralhamento pode ser melhorado. A documentação é limitada em partes mais complexas e o tratamento de erros poderia ser mais consistente.

Em relação aos testes, a maioria dos testes unitários passa, o que indica uma boa base inicial, mas ainda há falhas que precisam de refinamento. Os testes end-to-end funcionam, porém são superficiais, focando mais em navegação do que em validação completa dos fluxos.

Faltam testes mais aprofundados para validar o conteúdo dos PDFs, o conteúdo do CSV gerado, variações na ordem das provas e validações de entrada. Também não há testes que simulem o preenchimento completo de formulários.

Mesmo assim, os testes estão organizados e bem escritos, servindo como uma boa base para evolução.

---

## Pergunta 3: Comparação com Meu Sistema

Ambos os sistemas atendem aos requisitos propostos.

O sistema da colega se destaca pela interface, usabilidade e intuitividade, especialmente na criação de questões. Ele oferece uma experiência mais amigável para o usuário final.

O meu sistema tem maior foco em testes, validações e robustez técnica. Em alguns pontos ele é mais simples na interface, mas mais rigoroso na implementação e na garantia de funcionamento.

De forma geral, o sistema dela é mais forte na experiência do usuário, enquanto o meu é mais forte em qualidade técnica e confiabilidade.

---

## Histórico do Desenvolvimento

### Estratégias de Interação Utilizada

A colega utilizou uma abordagem baseada em prompts pequenos e sequenciais, construindo o sistema de forma incremental. Cada funcionalidade foi desenvolvida em etapas bem definidas, o que demonstra organização e entendimento do processo.

### Situações em que o Agente Funcionou Melhor ou Pior

O agente funcionou melhor no início do projeto, especialmente na criação da estrutura inicial e na implementação de funcionalidades mais diretas. Também teve bom desempenho em ajustes de interface.

O desempenho foi mais limitado em tarefas de refatoração, integração entre partes do sistema, escrita de testes e correção de erros mais complexos. Com o crescimento do projeto, a dificuldade aumentou.

### Tipos de Problemas Observados

Foram observadas algumas inconsistências entre o que foi solicitado e o que foi implementado. Também houve problemas de configuração, como em Docker e package.json, e dificuldades relacionadas à persistência de dados.

Em alguns momentos, partes do sistema foram implementadas sem integração completa. Algumas correções exigiram múltiplas tentativas até funcionarem corretamente, e houve situações em que a solução proposta inicialmente não resolvia o problema.

### Avaliação Geral da Utilidade do Agente

O agente foi bastante útil, principalmente no início do projeto, acelerando a criação da base do sistema e das primeiras funcionalidades.

Com o aumento da complexidade, foi necessário maior acompanhamento e revisão, especialmente em testes e correções mais específicas.

### Comparação com Minha Experiência de Uso

Na minha experiência, utilizei prompts mais detalhados e estruturados, o que resultou em maior consistência ao longo do desenvolvimento e menos retrabalho em alguns momentos.

Na experiência da colega, a abordagem foi mais incremental, com maior interação contínua com o agente e mais ajustes ao longo do processo.

As duas abordagens funcionaram, mas a minha foi mais estável ao longo do tempo, enquanto a dela permitiu maior adaptação durante o desenvolvimento.

---

## Conclusão Geral

O sistema desenvolvido atende aos requisitos e apresenta como principal destaque a qualidade da interface e da experiência do usuário.

Há oportunidades de melhoria principalmente na parte de testes, validações e organização interna do código, mas a base do sistema é sólida.

O uso do agente foi fundamental para o desenvolvimento, especialmente nas fases iniciais, mostrando grande utilidade, embora com limitações à medida que a complexidade do projeto aumentou.
