pipeline {
    agent any

    environment {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true'
        SONAR_TOKEN = credentials('sonar-token')
        PATH = "$PATH:/var/jenkins_home/.dotnet/tools"
    }

    tools {
        dotnetsdk 'dotnet-sdk'
        nodejs 'node20' 
    }

    stages {
        stage('Backend & SonarQube Analizi') {
            steps {
                dir('DisSagligiTakipApp.API') {
                    echo 'SonarQube Scanner Aracı Kuruluyor/Kontrol Ediliyor...'
                    sh 'dotnet tool install --global dotnet-sonarscanner || true'
                    
                    echo 'SonarQube Analizi Başlatılıyor...'
                    sh 'dotnet sonarscanner begin /k:"DisSagligiBackend" /d:sonar.token="${SONAR_TOKEN}" /d:sonar.host.url="http://localhost:9000"'
                    
                    echo 'Backend Derleniyor...'
                    sh 'dotnet build'
                    
                    echo 'Analiz Sonuçları Gönderiliyor...'
                    sh 'dotnet sonarscanner end /d:sonar.token="${SONAR_TOKEN}"'
                }
            }
        }

        stage('Frontend Hazırlık (Sakai-React)') {
            steps {
                dir('sakai-react-master/sakai-react-master') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
    }
}