# Executar o Beach Chama no Android

Como buildar o projeto, sincronizar com o Capacitor e rodar em emulador ou dispositivo Android.

## Pré-requisitos

- Node.js e npm instalados
- Android Studio instalado (SDK e emulador)
- Dispositivo físico: cabo USB e depuração USB habilitada

## 1. Build do projeto

```bash
npm install
ionic build
```

O build gera os arquivos na pasta `www/`.

## 2. Sincronizar com o Capacitor

```bash
npx cap sync android
```

Copia `www/` para o projeto Android e atualiza os plugins.

## 3. Abrir no Android Studio

```bash
npx cap open android
```

## 4. Rodar em emulador

1. No Android Studio: Device Manager, crie/inicie um AVD.
2. Menu Run (ou ícone de play) e execute o app.

Ou na linha de comando (emulador já iniciado):

```bash
npx cap run android
```

## 5. Rodar em dispositivo USB

1. Conecte o dispositivo por USB.
2. Ative Depuração USB nas opções de desenvolvedor.
3. No Android Studio, selecione o dispositivo e clique em Run.

Ou: `npx cap run android --target` e escolha o dispositivo.

## Observacoes

- Após mudanças no código web: `ionic build` e `npx cap sync android` antes de rodar no Android.
- Permissões de localização e notificações são solicitadas em tempo de execução.
- appId em `capacitor.config.ts` (ex.: com.beachchama.app).
