# Chut On

My own Wordle inspired game for Portuguese words, written in vanilla Javascript as a refactoring playground.

Play it online: <https://rafaelodon.github.io/chuton/>

**ALERT:** you'll find very bad under-construction code here (and very very very bad CSS too)

The dictionary with more than 11k words is available at `js/words.json`, consisting of an object whose fields are:
- **selected**: an array of 1k popular 5-letter words to be used as solutions
- **index**: a valid-word map consisting of the non-accentuated version of a word as key, and an array with all its variations as value (i.e. `{ "tobas" : ["tobas","tobás"] }`)

## Credits:
* Words scraped from:
  * <http://dicio.com.br/>
  * <https://www.palavras.net/>
  * <https://museulinguaportuguesa.org.br/>
  * <https://www.ime.usp.br/~pf/dicios/>
  
* Mobile verification regex adapted from <http://detectmobilebrowsers.com/>

The scraping strategy is at `util/scrape.py`.
