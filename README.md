# Rodacerto - A Verdade Nua e Crua da Estrada

**Rodacerto** é uma ferramenta open-source para motoristas (aplicativo, caminhoneiros, ou uso pessoal) calcularem se vale a pena ter carro próprio, alugar, ou usar transporte por aplicativo. O foco é desvendar os "custos invisíveis" (depreciação, manutenção, multas) e dar uma resposta financeira clara.

## 🎯 Contexto & Prompt Original (Para IAs Colaboradoras)

> **"A matemática que o motorista não faz."**
>
> O objetivo do projeto é criar uma ferramenta web (PWA) extremamente simples, mobile-first, que ajude motoristas a tomarem decisões financeiras sobre veículos.
>
> **Problema:** Muitos motoristas olham apenas para a parcela do financiamento e o combustível, esquecendo de calcular seguro, IPVA, manutenção preventiva/corretiva, depreciação do veículo e o risco de multas.
>
> **Solução:** Uma calculadora passo-a-passo onde o usuário insere dados básicos (modelo do carro, km/mês, consumo) e o sistema cospe a verdade:
> - Custo real por KM rodado.
> - Comparativo: Carro Próprio vs. Aluguel vs. Uber.
> - Gasolina ou Etanol (com base no preço médio do estado).
> - Impacto das multas no orçamento anual.
>
> **Vibe do Projeto:**
> - **Design:** Clean, moderno, "dark mode" por padrão (descansa a vista), botões grandes.
> - **UX:** Poucos inputs, muitos defaults inteligentes (puxe dados médios se o usuário não souber).
> - **Tom de Voz:** Direto, amigo, "nós contra o sistema".

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+ (App Router)](https://nextjs.org/)
- **Linguagem:** TypeScript
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Banco de Dados & Auth:** [Supabase](https://supabase.com/)
- **Deploy:** Vercel

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/alinessgarcia/rodacerto.git
   cd rodacerto
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env.local` na raiz com suas chaves do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

4. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse:** [http://localhost:3000](http://localhost:3000)

## 🗄️ Estrutura do Banco de Dados (Supabase)

O projeto utiliza as seguintes tabelas principais (ver `database/schema.sql`):
- `fuel_prices`: Histórico de preços de combustível por estado (atualizado via script Python).
- `vehicles_base`: Tabela base de veículos (FIPE, consumo médio).
- `user_simulations`: Simulações salvas pelos usuários.
- `fine_statistics`: Estatísticas de multas para cálculo de risco.

## 🤝 Contribuição

Sinta-se à vontade para abrir Issues ou Pull Requests. O foco é manter a simplicidade para o usuário final.
