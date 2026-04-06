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
                dir('DisSagligiTakipApp.API') {
                    sh 'dotnet build'
                }
            }
        }

        stage('Frontend Hazirlik (Sakai-React)') {
            steps {
                dir('sakai-react-master/sakai-react-master') {
                    echo 'Doğru klasörde miyiz kontrol ediliyor...'
                    sh 'ls' 
                    
                    echo 'React kütüphaneleri indiriliyor...'
                    sh 'npm install'
                    
                    echo 'Frontend build ediliyor...'
                    sh 'npm run build'
                }
            }
        }
    }
}