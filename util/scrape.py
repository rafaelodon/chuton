import traceback
from urllib import request
import requests
from bs4 import BeautifulSoup
import json
import re    
import random
import unicodedata
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CLEAN = re.compile('<.*?>')

HEADERS = {
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) "
}

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    only_ascii = nfkd_form.encode('ASCII', 'ignore')
    return only_ascii

def scrap_words_from_selector(url, selector):
    try:        
        resp = requests.get(url, verify=False, headers=HEADERS)
        soup = BeautifulSoup(resp.text, 'html.parser')
        text = str(soup.select(selector)[0])                            
        words = list(filter(lambda w: len(w) == 5, re.sub(CLEAN, ' ', text).split()))        
        print(f"{url} {len(words)}")
        return words
    except:
        print(f"{url} falhou!")
        print(traceback.format_exc())
        return []

def scrape_dicio():
    words2 = []
    for c in "abcdefghijklmnopqrstuvwxyz":                  
        url = f'https://www.dicio.com.br/palavras-comecam-{c}-com-5-letras/'            
        foundWords = scrape_dicio_words(url)
        words2.extend(foundWords)        
        print(f"Total {len(words2)}")
    return words2

def scrape_dicio_words(url):       
    selector = '#content > div.col-xs-12.col-md-8.card > p:nth-child(4)'
    return scrap_words_from_selector(url, selector)

def scrape_museu():    
    url = 'https://museulinguaportuguesa.org.br/palavras-com-5-letras/'
    selector = '#post-309 > div:nth-child(2) > div.td-pb-span8.td-main-content > div > div.td-post-content > p:nth-child(4)'
    return scrap_words_from_selector(url, selector)

def scrape_palavras_net_words(url):    
    selector = 'div[lang=pt]'
    return scrap_words_from_selector(url, selector)    

def scrape_palavras_net():
    words3 = []
    for c in "abcdefghijklmnopqrstuvwxyz":                  
        url = f'https://www.palavras.net/search.php?i={c}&fnl=5&fnl2=5'            
        foundWords = scrape_palavras_net_words(url)
        words3.extend(foundWords)        
        print(f"Total {len(words3)}")
    return words3

def scrape_ime_usp():
    resp = requests.get("https://www.ime.usp.br/~pf/dicios/br-utf8.txt", verify=False)
    return list(filter(lambda w: len(w) == 5, resp.text.split('\n')))

def scrape():
            
    # list of 1000 popular 5 letters words (game candidates)
    words1 = scrape_dicio_words('https://www.dicio.com.br/palavras-com-cinco-letras/')
    with open('words1.txt','w') as f:
        for w in words1:
            f.write(f"{w}\n")
    
    # scrape all the 5 letters words from dicio (for word valdation)
    words2 = scrape_dicio()  
    with open('words2.txt','w') as f:
        for w in words2:
            f.write(f"{w}\n")

    # scrape all the 5 letters words from palavras.net (for word validation)
    words3 = scrape_palavras_net()
    with open('words3.txt','w') as f:
        for w in words3:
            f.write(f"{w}\n")
    
    # scrape some more words from museu lingua portuguesa
    words4 = scrape_museu()
    with open('words4.txt','w') as f:
        for w in words4:
            f.write(f"{w}\n")

    # scrape 5 letters words from IME USP all-words list
    words5 = scrape_ime_usp()
    with open("words5.txt","w") as f:
        for w in words5:
            f.write(f"{w}\n")    

def create_words_json():
    
    # game candidates
    selectedWords = [w.lower().strip() for w in tuple(open('words1.txt', 'r'))]    
    random.shuffle(selectedWords) # shuffle to discard scrape order
    
    # valid words
    words2 = [w.lower().strip() for w in tuple(open('words2.txt', 'r'))]    
    words3 = [w.lower().strip() for w in tuple(open('words3.txt', 'r'))]
    words4 = [w.lower().strip() for w in tuple(open('words4.txt', 'r'))]        
    words5 = [w.lower().strip() for w in tuple(open('words5.txt', 'r'))]        
    validWords=[]    
    validWords.extend(selectedWords)          
    validWords.extend(words2)
    validWords.extend(words3)
    validWords.extend(words4)
    validWords.extend(words5)
    validWords = list(dict.fromkeys(validWords)) # remove duplicates
    validWords = sorted(validWords)    

    # create a normalized index for validy word check
    # 'tabua' -> ['tabuã','tábua']
    normal = {}
    for m in validWords:
        norm = remove_accents(m).lower().strip().decode('utf8')
        if norm not in normal:
            normal[norm] = [m]
        else:
            normal[norm].append(m)            

    print("Selected",len(selectedWords))  
    print("Valid",len(validWords))
    print("Normalized",len(normal.keys()))

    # create the words.json file
    with open('words.json','w') as f:
        json.dump({'selected':selectedWords,'index':normal},f)

if __name__ == "__main__":
    scrape()
    create_words_json()

