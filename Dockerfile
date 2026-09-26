# syntax=docker/dockerfile:1
# Office Case Files: one same-origin container (ASP.NET Core API + built React app).
# Base images are pinned to the local toolchain versions (Node 24.15.0, .NET SDK 10.0.401, runtime 10.0.12).

FROM node:24.15.0-bookworm-slim AS web
WORKDIR /src/apps/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY apps/web/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0.401 AS api
WORKDIR /src
COPY global.json Directory.Build.props NuGet.Config ./
COPY services/api/OfficeCaseFiles.Api.csproj services/api/packages.lock.json services/api/
RUN dotnet restore services/api/OfficeCaseFiles.Api.csproj --locked-mode
COPY services/api/ services/api/
RUN dotnet publish services/api/OfficeCaseFiles.Api.csproj -c Release --no-restore -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0.12 AS runtime
WORKDIR /app
COPY --from=api /app ./
# Only the built web app is public; case content stays in /app/Content, outside wwwroot.
COPY --from=web /src/apps/web/dist ./wwwroot
RUN mkdir -p /data && chown app:app /data
ENV ASPNETCORE_HTTP_PORTS=8080 \
    ConnectionStrings__Game="Data Source=/data/office-case-files.db"
USER app
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD ["dotnet", "OfficeCaseFiles.Api.dll", "--healthcheck"]
ENTRYPOINT ["dotnet", "OfficeCaseFiles.Api.dll"]
