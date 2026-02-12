@echo off
TITLE NodeBuilder IDE - Industrial Launcher
COLOR 0B
CLS

echo ==========================================================
echo    NODEBUILDER IDE - PLATAFORMA LOW-CODE INDUSTRIAL
echo ==========================================================
echo.
echo [1/3] Verificando Requisitos do Sistema...

:: Verificar Node.js (Sintaxe Legada para maxima compatibilidade)
node -v >nul 2>&1
if errorlevel 1 goto :NODE_ERROR
echo [OK] Node.js detectado.

:: Verificar Docker
docker info >nul 2>&1
if errorlevel 1 goto :DOCKER_WARNING
echo [OK] Docker detectado e ativo.
goto :INSTALL_STEP

:DOCKER_WARNING
echo [AVISO] Docker nao detectado ou nao iniciado. 
echo         Servicos de container (Launch) nao funcionarao.
goto :INSTALL_STEP

:NODE_ERROR
echo [ERRO] Node.js nao encontrado! Por favor, instale o Node.js v20+.
pause
exit /b

:INSTALL_STEP
echo.
echo [2/3] Sincronizando Dependencias do Monorepo...
echo [INFO] Isso pode levar alguns instantes...
call npm install

echo.
echo [3/3] Disparando Motores NodeBuilder...
echo [INFO] Abrindo Backend (API) e Frontend (Web) em novas janelas.
echo.

:: Iniciar API (Backend)
start "NodeBuilder API" cmd /c "echo Iniciando API... && cd apps/api && npm run dev || npx tsx watch src/index.ts"

:: Iniciar Web (Frontend)
start "NodeBuilder Web" cmd /c "echo Iniciando Frontend... && cd apps/web && npm run dev"

echo ==========================================================
echo NodeBuilder esta em processo de inicializacao!
echo.
echo Painel de Controle: http://localhost:5173
echo Enderecos da API:   http://localhost:3000/docs
echo ==========================================================
echo.
echo Pressione qualquer tecla para encerrar este controlador.
pause >nul
