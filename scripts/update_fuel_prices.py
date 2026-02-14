import os
import requests
import psycopg2
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# URL da ANP ou fonte confiável (Ex: Preço Médio Ponderado ao Consumidor Final)
ANP_URL = "https://preco.anp.gov.br/"  # Placeholder - precisaremos de uma fonte real scrapeável

def fetch_fuel_prices():
    """
    Busca preço médio de gasolina/etanol por estado.
    Simulação: Retorna dados estáticos por enquanto.
    """
    print(f"[{datetime.now()}] Iniciando coleta de preços de combustível...")
    
    # Mock data (futuro: usar requests + BeautifulSoup)
    prices = [
        {"state": "SP", "fuel": "gasolina", "price": 5.89},
        {"state": "SP", "fuel": "etanol", "price": 3.45},
        {"state": "RJ", "fuel": "gasolina", "price": 6.12},
        {"state": "RJ", "fuel": "etanol", "price": 4.10},
        {"state": "MG", "fuel": "gasolina", "price": 5.95},
        {"state": "MG", "fuel": "etanol", "price": 3.80},
    ]
    
    return prices

def update_database(prices):
    """
    Insere/Atualiza preços no Supabase via API ou conexão direta (psycopg2 se tiver connection string).
    Aqui usaremos a REST API do Supabase pela simplicidade.
    """
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates" # Upsert
    }
    
    endpoint = f"{SUPABASE_URL}/rest/v1/fuel_prices"
    
    payload = []
    for p in prices:
        payload.append({
            "state_code": p["state"],
            "fuel_type": p["fuel"],
            "price": p["price"],
            "updated_at": datetime.now().isoformat()
        })
        
    try:
        response = requests.post(endpoint, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            print(f"Sucesso! {len(payload)} registros atualizados.")
        else:
            print(f"Erro ao atualizar DB: {response.text}")
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    data = fetch_fuel_prices()
    if data:
        update_database(data)
