import hashlib
import random
import string

############################################################################################################
##### Proof of work challenge
############################################################################################################


def pow_challenge():
    challenge = "".join(random.choices(string.ascii_uppercase + string.digits, k=15))
    return challenge


def pow_verify(challenge, solution, difficulty):
    hash = hashlib.sha256((challenge + str(solution)).encode()).hexdigest()
    if hash[:difficulty] == "0" * difficulty:  # Adjust difficulty as needed
        return True
    else:
        return False
