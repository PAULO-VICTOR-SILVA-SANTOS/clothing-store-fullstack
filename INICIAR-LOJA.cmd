@echo off
chcp 65001 >nul
title Castro Multimarcas - abrir loja local
pushd "%~dp0"

echo.
echo === Castro Multimarcas ===
echo Abrindo o Vite numa NOVA janela. Deixe essa janela aberta enquanto testar a loja.
echo.

start "Castro Multimarcas - Vite" cmd /k "npm run dev"

echo Aguardando o servidor em http://127.0.0.1:5173/ ...
ping 127.0.0.1 -n 10 >nul

start "" "http://127.0.0.1:5173/"

echo.
echo Se o navegador mostrar "nao foi possivel conectar", espere mais uns segundos e pressione F5.
echo Para parar o servidor, feche a janela do Vite.
echo.
pause
popd
