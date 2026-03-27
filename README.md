# APPBT

Aplicativo para organização de partidas de **Beach Tennis** na quadra **TOP SPORTS CLUB**, Porto Alegre.

- **Stack:** Ionic + Angular (standalone) + Capacitor
- **Persistência:** Ionic Storage (armazenamento local)
- **Recursos nativos:** Geolocation e Local Notifications (Capacitor)

---

## Arquitetura

### Estrutura de pastas

```
src/app/
├── models/           # Modelos tipados (User, Quadra, Partida, Interessado)
├── services/         # Lógica de negócio e acesso a dados
│   ├── data.service.ts        # CRUD via Ionic Storage (usuários, quadras, partidas, interessados)
│   ├── auth.service.ts       # Login/cadastro e sessão
│   ├── location.service.ts   # Geolocalização e distância até a quadra
│   └── notification.service.ts# Notificações locais (partida criada, lembrete 30 min, modo emergência)
├── guards/           # Proteção de rotas
│   ├── auth.guard.ts         # Exige usuário logado
│   └── admin.guard.ts       # Exige usuário tipo admin
├── pages/            # Páginas da aplicação
│   ├── login/
│   ├── register/
│   ├── home/
│   ├── partidas/
│   ├── criar-partida/
│   ├── admin/
│   ├── admin-quadras/
│   └── admin-interessados/
└── app.routes.ts     # Rotas e guards
```

### Regras de negócio (resumo)

- **Usuário comum:** vê apenas partidas de quadras ativas; ao logar, pode solicitar localização para exibir distância até a TOP SPORTS CLUB.
- **Partida masculina:** notificação apenas para usuários masculinos compatíveis (nível e categoria).
- **Partida feminina:** notificação apenas para usuárias femininas compatíveis.
- **Partida mista:** notificação para quem tem categoria mista; composição homem/mulher pode ser controlada (quem falta).
- **Modo emergência:** se ativo e faltando menos de 30 min para a partida, permite notificar qualquer sexo compatível com o nível.
- **Administrador:** cadastra quadras (ativar/desativar), interessados (sem localização) e cria partidas; notificações são disparadas ao criar partida, 30 min antes e ao ativar modo emergência.

### Autenticação

- Login e cadastro baseados em armazenamento local (e-mail + senha).
- Cadastro apenas para **usuário comum**; administrador padrão vem no seed (ver abaixo).
- Guard de rota protege páginas internas; admin guard restringe área administrativa.

### Seed inicial

Na primeira execução, se não houver dados, o app cria:

- **Admin:** e-mail `admin@appbt.com`, senha `admin123` (use para acessar a área administrativa).
- **Quadra:** TOP SPORTS CLUB, Porto Alegre, ativa.

---

## Como rodar

### Navegador

```bash
npm install
npm start
```

Acesse `http://localhost:8100` (ou a porta indicada).

### Build e Android (emulador ou dispositivo)

```bash
npm install
npm run build
npx cap add android
npx cap sync
npx cap open android
```

No Android Studio, use um emulador ou dispositivo físico e rode o app.

**Permissões Android:** o projeto usa Geolocation e Local Notifications; permissões de local e notificação devem ser concedidas no dispositivo. Para notificações agendadas com precisão (ex.: 30 min antes), pode ser necessário `SCHEDULE_EXACT_ALARM` no `AndroidManifest.xml` (já considerado na documentação do Capacitor).

---

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Público | Login |
| `/register` | Público | Cadastro (usuário comum) |
| `/home` | Logado | Início; distância até a quadra (se houver localização) |
| `/partidas` | Logado | Listagem de partidas (quadras ativas); confirmar presença |
| `/criar-partida` | Admin | Criar nova partida |
| `/admin` | Admin | Menu da área administrativa |
| `/admin/quadras` | Admin | Cadastro e ativar/desativar quadras |
| `/admin/interessados` | Admin | Cadastro de interessados (sem app/localização) |

---

## Tecnologias

- **Ionic 8** (componentes: ion-list, ion-card, ion-segment, ion-select, ion-modal, ion-toast, etc.)
- **Angular 20** (standalone)
- **Capacitor 6** (Geolocation, Local Notifications)
- **@ionic/storage-angular** (persistência local)

Sem bibliotecas externas além das listadas.
