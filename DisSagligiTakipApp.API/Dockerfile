FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["DisSagligiTakipApp.API/DisSagligiTakipApp.API.csproj", "DisSagligiTakipApp.API/"]
COPY ["DisSagligiTakipApp.Core/DisSagligiTakipApp.Core.csproj", "DisSagligiTakipApp.Core/"]
COPY ["DisSagligiTakipApp.Data/DisSagligiTakipApp.Data.csproj", "DisSagligiTakipApp.Data/"]
COPY ["DisSagligiTakipApp.Service/DisSagligiTakipApp.Service.csproj", "DisSagligiTakipApp.Service/"]

RUN dotnet restore "DisSagligiTakipApp.API/DisSagligiTakipApp.API.csproj"

COPY . .
WORKDIR "/src/DisSagligiTakipApp.API"

RUN dotnet build "DisSagligiTakipApp.API.csproj" -c Release -o /app/build

# AS publish ekini unutmamalıyız
FROM build AS publish
RUN dotnet publish "DisSagligiTakipApp.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DisSagligiTakipApp.API.dll"]