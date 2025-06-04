# 🥥 Coco Bambu QA Automation Challenge

![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> **Desafio técnico para QA Engineer** - Automatização de testes para a plataforma de delivery do Coco Bambu

## 📋 Sobre o Projeto

Este projeto implementa uma suíte completa de testes automatizados para validar os fluxos críticos da plataforma de delivery do Coco Bambu, incluindo:

- ✅ **Testes de UI** - Fluxos críticos de usuário (Add to Cart, Checkout, etc.)
- ✅ **Testes de API** - Operações de carrinho usando DummyJSON
- ✅ **Page Object Model** - Arquitetura escalável e maintível
- ✅ **Data-Driven Testing** - Cenários com múltiplos datasets
- ✅ **Relatórios Avançados** - Screenshots, vídeos e métricas

## 🎯 Fluxos Críticos Identificados

### 1. **Seleção e Validação de Endereço**
- Primeira barreira de conversão
- Validação de área de cobertura
- Impacto no cálculo de frete

### 2. **Adição de Itens ao Carrinho**
- Core da conversão de vendas
- Validação de disponibilidade
- Processamento de preços e promoções

### 3. **Finalização de Compra**
- Última milha do funil
- Integração com gateways de pagamento
- Maior valor por transação

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Git**

### Verificando as versões:
```bash
node --version    # v16.0.0 ou superior
npm --version     # 8.0.0 ou superior
git --version     # qualquer versão recente
```

## 🚀 Instalação e Configuração

### 1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/coco-bambu-qa-challenge.git
cd coco-bambu-qa-challenge
```

### 2. **Instale as dependências**
```bash
npm install
```

### 3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env  # ou use seu editor preferido
```

### 4. **Verifique a instalação**
```bash
# Abra o Cypress Test Runner
npm run cy:open

# Ou execute um teste de exemplo
npm run cy:run -- --spec "cypress/e2e/examples/**/*"
```

## 📁 Estrutura do Projeto

```
coco-bambu-qa-challenge/
├── 📄 README.md                    # Este arquivo
├── 📄 package.json                 # Dependências e scripts
├── 📄 cypress.config.js            # Configuração do Cypress
├── 📄 .gitignore                   # Arquivos ignorados pelo Git
├── 📄 .env.example                 # Exemplo de variáveis de ambiente
├── 📁 cypress/
│   ├── 📁 e2e/                     # Testes end-to-end
│   │   ├── 📁 ui/                  # Testes de interface
│   │   ├── 📁 api/                 # Testes de API
│   │   └── 📁 smoke/               # Testes de smoke
│   ├── 📁 support/                 # Arquivos de suporte
│   │   ├── 📁 page-objects/        # Page Object Models
│   │   ├── 📁 helpers/             # Funções auxiliares
│   │   └── 📁 fixtures/            # Dados de teste
│   ├── 📁 screenshots/             # Screenshots dos testes
│   ├── 📁 videos/                  # Vídeos das execuções
│   └── 📁 reports/                 # Relatórios gerados
└── 📁 docs/                        # Documentação adicional
```

## 🎮 Comandos Disponíveis

### **Execução dos Testes**
```bash
# Abrir o Test Runner (modo interativo)
npm run cy:open

# Executar todos os testes (modo headless)
npm run cy:run

# Executar testes específicos
npm run test:api      # Apenas testes de API
npm run test:ui       # Apenas testes de UI
npm run test:smoke    # Apenas testes de smoke

# Executar em navegadores específicos
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### **Relatórios e Análise**
```bash
# Gerar relatórios consolidados
npm run report:merge
npm run report:generate

# Verificar qualidade do código
npm run lint
npm run lint:fix
```

## 🧪 Executando os Testes

### **Primeira Execução (Smoke Test)**
```bash
# Execute os testes básicos para verificar se tudo está funcionando
npm run test:smoke
```

### **Testes de API (DummyJSON)**
```bash
# Testar operações de carrinho
npm run test:api

# Verificar os resultados em:
# - cypress/reports/
# - Terminal output
```

### **Testes de UI (Coco Bambu)**
```bash
# Testar fluxos críticos da interface
npm run test:ui

# Para debug, use o modo interativo:
npm run cy:open
```

## 📊 Relatórios e Monitoramento

### **Tipos de Relatório Gerados:**
- 📈 **HTML Report** - Relatório visual com gráficos
- 📱 **Screenshots** - Capturadas em falhas
- 🎥 **Vídeos** - Gravação das execuções
- 📋 **JSON Reports** - Para integração CI/CD

### **Localizações:**
```
cypress/
├── reports/          # Relatórios HTML
├── screenshots/      # Capturas de tela
└── videos/          # Gravações
```

## 🔧 Configuração Avançada

### **Variáveis de Ambiente Importantes**
```bash
# URLs
BASE_URL=https://app-hom.cocobambu.com
API_URL=https://dummyjson.com

# Configurações de Teste
HEADLESS=true                    # Executar sem interface gráfica
BROWSER=chrome                   # Navegador padrão
REQUEST_TIMEOUT=10000           # Timeout para requisições
```

### **Configurações de Browser**
```javascript
// cypress.config.js - Configurações específicas
{
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true
}
```

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **Erro: "Cypress not found"**
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

#### **Testes falhando por timeout**
```bash
# Aumente os timeouts no cypress.config.js
defaultCommandTimeout: 15000
pageLoadTimeout: 45000
```

#### **Problemas com certificados SSL**
```bash
# Configure no cypress.config.js
chromeWebSecurity: false
```

### **Debug Avançado**
```bash
# Execute com logs detalhados
DEBUG=cypress:* npm run cy:run

# Execute teste específico com retry
npx cypress run --spec "cypress/e2e/api/cart-management.cy.js" --headed
```

## 📞 Suporte

### **Recursos Úteis**
- 📖 [Documentação do Cypress](https://docs.cypress.io)
- 🎯 [DummyJSON API Docs](https://dummyjson.com/docs)
- 🥥 [Coco Bambu Platform](https://app-hom.cocobambu.com)

### **Para Questões Técnicas**
1. Verifique os logs de erro
2. Consulte a documentação
3. Execute em modo debug (`npm run cy:open`)

## 🚀 Próximos Passos

Após a configuração inicial:

1. ✅ Execute o smoke test
2. ✅ Revise os Page Objects
3. ✅ Execute testes de API
4. ✅ Execute testes de UI
5. ✅ Analise os relatórios gerados

---

**Desenvolvido com ❤️ para o desafio técnico Coco Bambu**