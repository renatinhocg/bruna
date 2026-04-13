@echo off
echo ========================================
echo Migracao do Sistema de Links
echo ========================================
echo.

cd backend

echo [1/3] Executando migracao do banco de dados...
call npx prisma migrate dev --name add_links_system

echo.
echo [2/3] Gerando cliente Prisma...
call npx prisma generate

echo.
echo [3/3] Migracao concluida com sucesso!
echo.
echo ========================================
echo Proximos passos:
echo ========================================
echo 1. Inicie o backend: cd backend && npm run dev
echo 2. Inicie o admin: cd admin && npm run dev
echo 3. Acesse: http://localhost:3001/links
echo ========================================

pause
