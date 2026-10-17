@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Publicar - Gestao de Licitacoes
cd /d "%~dp0"

echo ============================================
echo   Publicar atualizacao - Gestao de Licitacoes
echo ============================================
echo.

where git >nul 2>nul || (echo [ERRO] Git nao encontrado. Instale o Git for Windows. & goto :fim)

rem --- 1. Pega a versao mais recente do GitHub
echo [1/5] Atualizando com o GitHub...
git pull --rebase origin main
if errorlevel 1 (echo [ERRO] Falha no git pull. Veja a mensagem acima. & goto :fim)
echo.

rem --- 2. Aplica os arquivos .patch deixados pelo Claude
echo [2/5] Aplicando atualizacoes (.patch)...
set "APLICOU=0"
for %%P in (*.patch) do (
  echo   - %%P
  git apply --whitespace=nowarn "%%P"
  if errorlevel 1 (
    echo [ERRO] Nao foi possivel aplicar %%P. Nada foi enviado.
    goto :fim
  )
  del "%%P"
  set "APLICOU=1"
)
if "!APLICOU!"=="0" echo   Nenhum .patch encontrado - enviando apenas alteracoes locais.
echo.

rem --- 3. Commit
echo [3/5] Registrando alteracoes...
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo   Nada para enviar.
  goto :sql
)
set "MSG=%~1"
if "!MSG!"=="" set "MSG=Atualizacao %date% %time:~0,5%"
git commit -m "!MSG!"
if errorlevel 1 (echo [ERRO] Falha no commit. & goto :fim)
echo.

rem --- 4. Envia para o GitHub (a Vercel publica sozinha)
echo [4/5] Enviando para o GitHub...
git push origin main
if errorlevel 1 (echo [ERRO] Falha no git push. & goto :fim)
echo   OK - a Vercel vai publicar em 1 a 2 minutos.
echo.

:sql
rem --- 5. SQL pendente para o Supabase
echo [5/5] Verificando SQL pendente...
set "SQLPEND="
if exist "supabase\*.sql" (
  for %%S in (supabase\*.sql) do (
    if not exist "supabase\aplicados\%%~nxS" set "SQLPEND=%%S"
  )
)
if not defined SQLPEND (
  echo   Nenhum SQL pendente.
  goto :fim
)
echo.
echo   Ha SQL para rodar no Supabase: !SQLPEND!
echo   O conteudo foi COPIADO. No SQL Editor que vai abrir:
echo   cole com Ctrl+V e clique em Run.
type "!SQLPEND!" | clip
start "" "https://supabase.com/dashboard/project/aqtvorxogkugoouwyecz/sql/new"
echo.
choice /c SN /m "Ja rodou o SQL com sucesso"
if errorlevel 2 (
  echo   Tudo bem - rode o publicar.bat de novo depois para repetir este passo.
  goto :fim
)
if not exist "supabase\aplicados" mkdir "supabase\aplicados"
copy /y "!SQLPEND!" "supabase\aplicados\" >nul
git add -A
git commit -m "SQL aplicado: !SQLPEND!" >nul
git push origin main >nul
echo   Registrado como aplicado.

:fim
echo.
echo ============================================
pause
