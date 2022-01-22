# -*- coding:utf-8 -*-

import requests
import hashlib

ip = ""

tag = "\x1b[31m"+"██╗     ██╗   ██╗██████╗ ██╗██╗  ██╗ ██████╗ ██████╗ ██╗███╗   ██╗"+"\x1b[0m"+"\x1b[33m"+"\n██║     ██║   ██║██╔══██╗██║╚██╗██╔╝██╔════╝██╔═══██╗██║████╗  ██║"+"\x1b[0m"+"\x1b[32m"+"\n██║     ██║   ██║██║  ██║██║ ╚███╔╝ ██║     ██║   ██║██║██╔██╗ ██║"+"\x1b[0m"+"\x1b[34m"+"\n██║     ██║   ██║██║  ██║██║ ██╔██╗ ██║     ██║   ██║██║██║╚██╗██║"+"\x1b[0m"+"\x1b[35m"+"\n███████╗╚██████╔╝██████╔╝██║██╔╝ ██╗╚██████╗╚██████╔╝██║██║ ╚████║"+"\n╚══════╝ ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝" + "\x1b[0m"
print(tag)

while True:
    print("\x1b[36m"+'═══════════════════════════════════════'+"\x1b[0m")
    print('1. těžba')
    print('2. stav peněženky')
    print('3. odeslání LudixCoinu')
#    print('4. Propojení peněženky s discordem')
    print('4. Založení nové peněženky')
    print("\x1b[31m"+'═════════CTRL + C pro ukončení═════════'+"\x1b[0m")

    menu = int(input("→"))

    if menu == 1:
        wallet = str(input("Zadej wallet: "))
        password = str(input("Zadej heslo: "))

        login_request = requests.get("http://"+ ip +"/login;" + wallet + ';' + password)
        if login_request.text == 'notcool':
            print("Login neúspěšně ověřen!")
        else:
            print("Login úspěšně ověřen!")
            while True:
                requested_hash = requests.get("http://"+ ip +"/request_hash")
                print("Current mining: " + requested_hash.text)

                success = 0
                nonce = 0

                while success != 1:
                    nonce = nonce + 1
                    possible_hash = (requested_hash.text + ":" + str(nonce)).encode('utf-8')
                    #print(possible_hash)

                    hash = hashlib.sha256(possible_hash).hexdigest()

                    if hash.startswith("00000") == True:
                        success = 1
            
                        hash_to_send = "http://"+ ip +"/verification;" + str(wallet) + ';' + str(password) + ';' + str(requested_hash.text) + ';' + str(nonce)
                        sending_hash = requests.get(hash_to_send)
                        print(sending_hash.text)

    if menu == 2:
        wallet = str(input("Zadej wallet: "))
        password = str(input("Zadej heslo: "))

        login_request = requests.get("http://"+ ip +"/login;" + wallet + ';' + password)
        if login_request.text == 'notcool':
            print("Login neúspěšně ověřen!")
        else:
            print("Login úspěšně ověřen!")
            request_balance = requests.get("http://"+ ip +"/request_balance;" + wallet)
            print("Aktuální stav peněženky je: " + str(request_balance.text))
    if menu == 3:
        wallet = str(input("Zadej wallet: "))
        password = str(input("Zadej heslo: "))
        want_to_send = str(input("Zadej počet LudixCoinů které chceš odeslat: "))
        to_whom = str(input("Zadejte název peněženky na kterou chcete LudixCoiny odeslat: "))

        send_request = requests.get("http://"+ ip +"/send;" + wallet + ";" + password + ";" + want_to_send + ";" + to_whom )
        print(send_request.text)

    if menu == 4:
        wallet = str(input("Zadej wallet: "))
        password = str(input("Zadej heslo: "))

        request_new_wallet = requests.get("http://"+ ip +"/request_new_wallet;" + wallet + ';' + password)
        print(request_new_wallet.text)
