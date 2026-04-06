pipeline {
    agent any

    environment {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true'
    }

    tools {
        dotnetsdk 'dotnet-sdk'
        nodejs 'node20' 
    }

    stages {
        stage('Backend Derleme (API)') {
            steps {
                echo 'Backend projesi derleniyor...'
                dir('DisSagligiTakipApp.API') {
                    sh 'dotnet build'
                }
            }
        }

        stage('Frontend Hazirlik (Sakai-React)') {
            steps {
                dir('sakai-react-master') {
                    echo 'React kütüphaneleri (npm install) indiriliyor...'
                    sh 'npm install'
                    
                    echo 'Frontend build işlemi başlatılıyor...'
                    sh 'npm run build'
                }
            }
        }
    }
}