from collections import defaultdict
import re

class AhoCorasick:

    def char_to_index(self, char):
        """Convert a-z ke index 0-25"""
        if 'a' <= char <= 'z':
            return ord(char) - 97
        else:
            return 0

    def __init__(self, words):
        # Clean words: lowercase + remove special chars
        self.words = []
        for word in words:
            cleaned_word = re.sub(r'[^\w\s]', '', word.lower()).strip()
            if cleaned_word:
                self.words.append(cleaned_word)

        if not self.words:
            self.max_states = 1
            self.goto = [[]]
            self.out = [0]
            self.fail = [0]
            self.states_count = 1
            return

        # Setup trie structure
        self.max_states = sum([len(word) for word in words])
        self.max_characters = 26

        self.out = [0]*(self.max_states+1)  # Bitmask: word endings
        self.fail = [-1]*(self.max_states+1)  # Failure links
        self.goto = [[-1]*self.max_characters for _ in range(self.max_states+1)]  # State transitions

        self.words = [word.lower() for word in words]
        self.states_count = self.build_matching()


    def build_matching(self) -> int:
        """Build trie + failure links"""
        if not self.words:
            return 1

        # STEP 1: Build trie (main paths)
        k = len(self.words)
        states = 1  # root = 0

        for i in range(k):
            word = self.words[i]
            current_state = 0

            for character in word:
                ch = self.char_to_index(character)

                # Kalo belum ada path -> bikin state baru
                if self.goto[current_state][ch] == -1:
                    self.goto[current_state][ch] = states
                    states += 1
                current_state = self.goto[current_state][ch]

            # Mark ending: word ke-i ends here
            self.out[current_state] |= (1<<i)

        # Default: kalo ga ada path, balik ke root
        for ch in range(self.max_characters):
            if self.goto[0][ch] == -1:
                self.goto[0][ch] = 0

        # STEP 2: Build failure links (BFS)
        queue = []
        for ch in range(self.max_characters):
            if self.goto[0][ch] != 0:
                self.fail[self.goto[0][ch]] = 0
                queue.append(self.goto[0][ch])

        while queue:
            state = queue.pop(0)
            for ch in range(self.max_characters):
                if self.goto[state][ch] != -1:
                    failure = self.fail[state]

                    # Cari fallback path yang work
                    while self.goto[failure][ch] == -1:
                        failure = self.fail[failure]

                    failure = self.goto[failure][ch]
                    self.fail[self.goto[state][ch]] = failure
                    self.out[self.goto[state][ch]] |= self.out[failure]
                    queue.append(self.goto[state][ch])

        return states

    def find_next_state(self, current_state, next_input):
        """Cari next state, pake failure link kalo perlu"""
        answer = current_state
        ch = self.char_to_index(next_input)

        while self.goto[answer][ch] == -1:
            answer = self.fail[answer]
        return self.goto[answer][ch]


    def search_words(self, text):
        """Main search: find all word occurrences in text"""
        if not self.words:
            return defaultdict(list)

        text = re.sub(r'[^\w\s]', '', text.lower())
        current_state = 0
        result = defaultdict(list)

        for i in range(len(text)):
            current_state = self.find_next_state(current_state, text[i])

            if self.out[current_state] == 0:
                continue

            # Ada match, cek word mana aja
            for j in range(len(self.words)):
                if (self.out[current_state] & (1<<j)) > 0:
                    word = self.words[j]
                    result[word].append(i-len(word)+1)
        return result

# ============= Test =============
if __name__ == "__main__":
    words = ["he", "she", "hers", "his"]
    text = "ahishers"
    aho_chorasick = AhoCorasick(words)
    result = aho_chorasick.search_words(text)
    for word in result:
        for i in result[word]:
            print("Word", word, "appears from", i, "to", i+len(word)-1)
