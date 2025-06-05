# App di Gestione Eventi - React Native

Questa è un'app sviluppata in **React Native** che consente agli utenti di gestire eventi, prenotazioni e organizzazioni. È suddivisa in due sezioni principali: una per l'utente normale e una per la gestione delle organizzazioni.

---

## Funzionalità

### Utente loggato
Una volta effettuato il login, l'utente può:
- Lanciare dadi
- Generare un nickname
- Aggiornare il profilo (solo il nome, l'immagine **non funziona** al momento)
- Prenotarsi ad eventi
- Visualizzare gli eventi prenotati ed eventualmente cancellare la prenotazione

### Membro di un'organizzazione
Se l'utente fa parte di un'organizzazione(al momento va aggiunta tramite db), ha accesso a funzionalità aggiuntive:
- Amministrare l’organizzazione (funzionalità parziale, es. cambio nome)
- Aggiungere nuovi eventi
- Modificare eventi esistenti
- Visualizzare la lista dei prenotati a un evento

---

## Struttura delle cartelle

- `home/`: pagine visibili prima del login (login e registrazione)
- `tabs/`: schermate accessibili dopo il login (index, eventi e prenotazioni)
- `page/`: pagine che non devono mostrare la barra di navigazione in basso (es. dado, nickname, profilo)
- `organization/`: tabs per la gestione delle organizzazioni

---


## Stack tecnologico

- React Native
- Expo
- Supabase

---

## Note

- Il caricamento dell'immagine profilo non è ancora supportato.
- La gestione avanzata delle organizzazioni è ancora in fase di sviluppo.
