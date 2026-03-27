# Etapa 3 – Checklist e confirmação de requisitos

## Confirmação do uso do Ionic

- **Sim.** O aplicativo Beach Chama é desenvolvido em **Ionic** (Ionic Angular), com estrutura de páginas, serviços e guards conforme o padrão do framework.

## Confirmação da autenticação

- **Sim.** O projeto possui:
  - Página de **login** (`/login`)
  - **Persistência de sessão** via Ionic Storage (email e userId)
  - **Controle de tipo de usuário** (admin ou comum) no modelo `User` e no `AuthService`
  - Usuário logado salvo no storage e recuperável com `AuthService.getCurrentUser()`

## Confirmação da persistência de dados

- **Sim.** Existe **persistência local** com **Ionic Storage** (`@ionic/storage-angular`), centralizada no **DataService**. Nenhuma página acessa o storage diretamente. O DataService oferece CRUD para:
  - usuários
  - quadras
  - partidas
  - interessados

## Confirmação do uso de GPS

- **Sim.** O projeto utiliza **@capacitor/geolocation** por meio do **GeolocationService**, que:
  - solicita permissão de localização (`requestPermissions()`)
  - obtém latitude e longitude (`getCurrentPosition()`)
  - trata erro e permissão negada
  - usa fallback no navegador com `navigator.geolocation` quando rodando com `ionic serve`

## Confirmação do uso de notificações

- **Sim.** O projeto utiliza **@capacitor/local-notifications** por meio do **NotificationService**, que:
  - solicita permissão de notificações (`requestPermissions()`)
  - envia notificação imediata (`sendTestNotification()` / `testNotification()`)
  - agenda notificação (`scheduleNotification()` – ex.: em 1 minuto)
  - usa fallback no navegador com a **Notification API** quando rodando em browser

## Instruções para rodar no Android

Consulte o arquivo **RUN_ANDROID.md** na raiz do projeto. Resumo:

1. **Build:** `ionic build`
2. **Sincronizar Capacitor:** `npx cap sync android`
3. **Abrir no Android Studio:** `npx cap open android`
4. **Emulador:** iniciar um AVD e rodar o app pelo Android Studio ou `npx cap run android`
5. **Dispositivo USB:** ativar depuração USB, conectar o aparelho e rodar o app selecionando o dispositivo

## Lista das páginas criadas

| Página            | Rota                 | Acesso   | Descrição                                              |
|-------------------|----------------------|----------|--------------------------------------------------------|
| Login             | `/login`             | Público  | Autenticação (email/senha)                             |
| Registrar         | `/register`          | Público  | Cadastro de novo usuário                               |
| Home              | `/home`              | Logado   | Início após login                                      |
| Partidas          | `/partidas`          | Logado   | Listagem de partidas                                   |
| Criar partida     | `/criar-partida`     | Admin    | Cadastro de nova partida                               |
| Admin             | `/admin`             | Admin    | Menu da área administrativa                            |
| Admin – Quadras   | `/admin/quadras`     | Admin    | CRUD de quadras                                        |
| Admin – Interessados | `/admin/interessados` | Admin  | Cadastro de interessados                               |
| Testes do dispositivo | `/admin/testes-nativos` | Admin | Testes de GPS e notificações                           |
| **Demo Etapa 3**  | `/admin/demo-etapa3` | Admin    | Demonstração técnica: autenticação, dados, GPS e notificações |

A página **Demo Etapa 3** é acessível apenas para usuários do tipo **admin** e está protegida pelo **AdminGuard**. Ela concentra a demonstração de todos os requisitos da Etapa 3 (autenticação, dados, GPS e notificações).
