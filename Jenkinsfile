pipeline {
    agent any

    environment {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true'
        SONAR_TOKEN = credentials('sonar-token')
    }

    tools {
        dotnetsdk 'dotnet-sdk'
        nodejs 'node20' 
    }

    stages {
        stage('Backend & SonarQube Analizi') {
            steps {
                dir('DisSagligiTakipApp.API') {
                    echo 'SonarQube Analizi Hazırlanıyor...'
                    
                    sh 'dotnet sonarscanner begin /k:"DisSagligiBackend" /d:sonar.token="${SONAR_TOKEN}" /d:sonar.host.url="http://localhost:9000"'
                    
                    echo 'Backend Derleniyor...'
                    sh 'dotnet build'
                    
                    echo 'Analiz Sonuçları SonarQube\'a Gönderiliyor...'
                    sh 'dotnet sonarscanner end /d:sonar.token="${SONAR_TOKEN}"'
                }
            }
        }

        stage('Frontend Hazırlık (Sakai-React)') {
            steps {
                dir('sakai-react-master/sakai-react-master') {
                    echo 'React kütüphaneleri yükleniyor...'
                    sh 'npm install'
                    echo 'Frontend build ediliyor...'
                    sh 'npm run build'
                }
            }
        }
    }
}