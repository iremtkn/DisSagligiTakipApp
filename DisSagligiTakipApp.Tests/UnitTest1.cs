using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using Xunit;

namespace DisSagligiTakipApp.Tests
{
    public class AnasayfaTestleri
    {
        [Fact] 
        public void Uygulama_Acildiginda_Sakai_Basligi_Gozukmeli()
        {
            var options = new ChromeOptions();
            
            using (IWebDriver driver = new ChromeDriver(options))
            {
                driver.Navigate().GoToUrl("http://localhost:3000"); 

                string sayfaBasligi = driver.Title;
                
                Assert.Contains("Sakai", sayfaBasligi); 
            }
        }
    }
}