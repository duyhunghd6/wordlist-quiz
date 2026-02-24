import random
import json

pc_templates = [
    ("She is playing football with her friends.", "She are playing football with her friends.", "Subject-verb agreement (is vs are)", "Cô ấy đang chơi bóng đá với bạn bè."),
    ("They are watching a movie in the living room.", "They is watching a movie in the living room.", "Subject-verb agreement (are vs is)", "Họ đang xem phim trong phòng khách."),
    ("I am reading an interesting book right now.", "I are reading an interesting book right now.", "Subject-verb agreement (am vs are)", "Tôi đang đọc một cuốn sách thú vị ngay bây giờ."),
    ("The dog is sleeping under the table.", "The dog am sleeping under the table.", "Subject-verb agreement (am vs is)", "Con chó đang ngủ dưới gầm bàn."),
    ("We are swimming in the ocean today.", "We is swimming in the ocean today.", "Subject-verb agreement (are vs is)", "Hôm nay chúng tôi đang bơi ở biển."),
    ("The baby is crying because he is hungry.", "The baby are crying because he is hungry.", "Subject-verb agreement", "Đứa bé đang khóc vì đói."),
    ("Look! The birds are flying very high.", "Look! The birds is flying very high.", "Plural subject with are", "Nhìn kìa! Những con chim đang bay rất cao."),
    ("My brother is doing his homework in his room.", "My brother am doing his homework in his room.", "He/is pairing", "Anh trai tôi đang làm bài tập trong phòng."),
    ("I am learning English on my computer.", "I is learning English on my computer.", "I/am pairing", "Tôi đang học tiếng Anh trên máy tính."),
    ("The sun is shining brightly today.", "The sun are shining brightly today.", "Singular noun with is", "Hôm nay mặt trời rọi sáng chói chang."),
    ("Are you listening to the teacher?", "Is you listening to the teacher?", "Question formation auxiliary", "Bạn có đang nghe giáo viên nói không?"),
    ("What is she cooking in the kitchen?", "What are she cooking in the kitchen?", "WH-question auxiliary", "Cô ấy đang nấu gì trong bếp vậy?"),
    ("The cars are moving fast on the highway.", "The cars is moving fast on the highway.", "Plural cars with are", "Những chiếc ô tô đang di chuyển nhanh trên đường cao tốc."),
    ("My parents are talking in the garden.", "My parents is talking in the garden.", "Plural parents with are", "Bố mẹ tôi đang nói chuyện trong vườn."),
    ("She is wearing a beautiful red dress.", "She are wearing a beautiful red dress.", "She/is pairing", "Cô ấy đang mặc một chiếc váy đỏ tuyệt đẹp."),
    ("The students are writing their test right now.", "The students is writing their test right now.", "Plural students with are", "Các học sinh đang làm bài kiểm tra ngay bây giờ."),
    ("He is drinking water because it's hot.", "He am drinking water because it's hot.", "He/is pairing", "Anh ấy đang uống nước vì trời nóng."),
    ("We are planning a trip to the beach.", "We am planning a trip to the beach.", "We/are pairing", "Chúng tôi đang lên kế hoạch cho một chuyến đi biển."),
    ("They aren't playing video games anymore.", "They isn't playing video games anymore.", "Negative plural auxiliary", "Họ không chơi trò chơi điện tử nữa."),
    ("Isn't he coming to the party tonight?", "Aren't he coming to the party tonight?", "Negative question auxiliary", "Anh ấy sẽ không đến bữa tiệc tối nay sao?")
]

pc_subjects = [("The cat", "is", "are", "Con mèo"), ("He", "is", "am", "Anh ấy"), ("My sister", "is", "are", "Chị gái tôi"), ("The machine", "is", "are", "Cái máy")]
pc_plural_subjects = [("The children", "are", "is", "Bọn trẻ"), ("The players", "are", "is", "Các cầu thủ"), ("My friends", "are", "is", "Bạn bè tôi")]
pc_verbs = [("running in the park", "đang chạy trong công viên"), ("eating lunch", "đang ăn trưa"), ("listening to music", "đang nghe nhạc"), ("painting a picture", "đang vẽ một bức tranh")]
for i in range(30):
    if i % 2 == 0:
        sub = random.choice(pc_subjects)
        verb = random.choice(pc_verbs)
        pc_templates.append((f"{sub[0]} {sub[1]} {verb[0]}.", f"{sub[0]} {sub[2]} {verb[0]}.", "Subject-verb agreement", f"{sub[3]} {verb[1]}."))
    else:
        sub = random.choice(pc_plural_subjects)
        verb = random.choice(pc_verbs)
        pc_templates.append((f"{sub[0]} {sub[1]} {verb[0]}.", f"{sub[0]} {sub[2]} {verb[0]}.", "Plural subject agreement", f"{sub[3]} {verb[1]}."))

ps_templates = [
    ("They walked to the school yesterday.", "They walk to the school yesterday.", "Past tense verb suffix (-ed) missing with time signal", "Họ đã đi bộ đến trường ngày hôm qua."),
    ("She visited her grandmother last week.", "She visits her grandmother last week.", "Present Simple vs Past Simple with past time signal", "Cô ấy đã đến thăm bà của mình vào tuần trước."),
    ("I ate a delicious pizza for dinner.", "I eated a delicious pizza for dinner.", "Irregular verb past form (ate vs eated)", "Tôi đã ăn một chiếc bánh pizza ngon cho bữa tối."),
    ("He bought a new bike on his birthday.", "He buyed a new bike on his birthday.", "Irregular verb past form (bought vs buyed)", "Anh ấy đã mua một chiếc xe đạp mới vào ngày sinh nhật của mình."),
    ("We saw a shooting star in the sky.", "We seen a shooting star in the sky.", "Past simple (saw) vs Past participle (seen)", "Chúng tôi đã nhìn thấy một ngôi sao băng trên bầu trời."),
    ("I played soccer with my friends on Sunday.", "I play soccer with my friends on Sunday.", "Missing -ed past tense suffix", "Tôi đã chơi bóng đá với bạn bè vào Chủ Nhật."),
    ("She jumped over the puddle.", "She jump over the puddle.", "Missing -ed past tense suffix", "Cô ấy đã nhảy qua vũng nước."),
    ("The bird flew away when I got close.", "The bird flied away when I got close.", "Irregular verb past form (flew vs flied)", "Con chim bay đi khi tôi đến gần."),
    ("They drank all the orange juice.", "They drinked all the orange juice.", "Irregular verb past form (drank vs drinked)", "Họ đã uống hết nước cam."),
    ("We watched a funny movie last night.", "We watchs a funny movie last night.", "Present tense distractor on past time signal", "Tối qua chúng tôi đã xem một bộ phim hài."),
    ("She didn't know the answer to the question.", "She didn't knew the answer to the question.", "Did not + bare infinitive rule", "Cô ấy không biết câu trả lời cho câu hỏi đó."),
    ("Did you go to the store earlier?", "Did you went to the store earlier?", "Did + bare infinitive rule in questions", "Bạn đã đến cửa hàng lúc nãy à?"),
    ("The phone rang while I was sleeping.", "The phone ringed while I was sleeping.", "Irregular verb past form (rang vs ringed)", "Điện thoại đã reo trong khi tôi đang ngủ."),
    ("He ran very fast to catch the bus.", "He runned very fast to catch the bus.", "Irregular verb past form (ran vs runned)", "Anh ấy đã chạy rất nhanh để bắt xe buýt."),
    ("I found a shiny coin on the sidewalk.", "I finded a shiny coin on the sidewalk.", "Irregular verb past form (found vs finded)", "Tôi đã tìm thấy một đồng xu sáng bóng trên vỉa hè."),
    ("The teacher smiled at the class.", "The teacher smile at the class.", "Missing past tense suffix (-ed)", "Giáo viên đã mỉm cười với cả lớp."),
    ("They didn't finish their lunch.", "They didn't finished their lunch.", "Did not + bare infinitive", "Họ đã không ăn hết bữa trưa của mình."),
    ("She took her dog for a long walk.", "She taked her dog for a long walk.", "Irregular verb past form (took vs taked)", "Cô ấy đã đưa chó đi dạo một đoạn dài."),
    ("We painted a picture in art class.", "We painting a picture in art class.", "Past simple vs continuous participle mix", "Chúng tôi đã vẽ một bức tranh trong giờ mỹ thuật."),
    ("What did you do during the summer break?", "What did you did during the summer break?", "Did + bare infinitive in WH-questions", "Bạn đã làm gì trong kỳ nghỉ hè?")
]
ps_irregulars = [
    ("went to the zoo", "goed to the zoo", "Past tense of go", "đã đi sở thú"),
    ("caught a fish", "catched a fish", "Past tense of catch", "đã bắt được một con cá"),
    ("taught a lesson", "teached a lesson", "Past tense of teach", "đã dạy một bài học"),
    ("slept all day", "sleeped all day", "Past tense of sleep", "đã ngủ cả ngày")
]
ps_regulars = [
    ("cleaned the room", "clean the room", "Missing -ed suffix", "đã dọn dẹp phòng"),
    ("washed the car", "washes the car", "Present distractor", "đã rửa ô tô"),
    ("studied hard", "study hard", "Missing -ed suffix", "đã học chăm chỉ")
]
for i in range(30):
    sub = random.choice(["He", "She", "They", "We"])
    sub_vi = {"He": "Anh ấy", "She": "Cô ấy", "They": "Họ", "We": "Chúng tôi"}[sub]
    if i % 2 == 0:
        verb = random.choice(ps_irregulars)
        ps_templates.append((f"{sub} {verb[0]}.", f"{sub} {verb[1]}.", verb[2], f"{sub_vi} {verb[3]}."))
    else:
        verb = random.choice(ps_regulars)
        ps_templates.append((f"{sub} {verb[0]}.", f"{sub} {verb[1]}.", verb[2], f"{sub_vi} {verb[3]}."))

rps_templates = [
    ("He plays basketball every Saturday.", "He play basketball every Saturday.", "Third-person singular 's' missing", "Anh ấy chơi bóng rổ vào mỗi thứ Bảy."),
    ("They eat breakfast at seven o'clock.", "They eats breakfast at seven o'clock.", "Incorrect third-person singular 's' on plural subject", "Họ ăn sáng lúc bảy giờ."),
    ("The earth goes around the sun.", "The earth go around the sun.", "Third-person singular 'es' missing", "Trái đất quay quanh mặt trời."),
    ("My cat sleeps on the sofa.", "My cat sleep on the sofa.", "Third-person singular 's' missing", "Con mèo của tôi ngủ trên ghế sofa."),
    ("I like to read books before bed.", "I likes to read books before bed.", "Incorrect 's' on first-person singular", "Tôi thích đọc sách trước khi đi ngủ."),
    ("We drink milk every morning.", "We drinks milk every morning.", "Incorrect 's' on plural subject", "Chúng tôi uống sữa mỗi sáng."),
    ("She watches cartoons after school.", "She watch cartoons after school.", "Third-person singular 'es' missing", "Cô ấy xem phim hoạt hình sau giờ học."),
    ("My dad drives a red car.", "My dad drive a red car.", "Third-person singular 's' missing", "Bố tôi lái một chiếc ô tô màu đỏ."),
    ("The birds sing beautiful songs.", "The birds sings beautiful songs.", "Incorrect 's' on plural subject", "Những con chim hát những bài hát tuyệt đẹp."),
    ("He rarely washes his hands.", "He rarely wash his hands.", "Third-person singular 'es' missing with adverb of frequency", "Anh ấy hiếm khi rửa tay."),
    ("She doesn't like spicy food.", "She don't like spicy food.", "Doesn't vs don't with third-person singular", "Cô ấy không thích đồ ăn cay."),
    ("They don't understand the homework.", "They doesn't understand the homework.", "Don't vs doesn't with plural subject", "Họ không hiểu bài tập về nhà."),
    ("Sarah rides her bike to the park.", "Sarah ride her bike to the park.", "Third-person singular 's' missing", "Sarah đạp xe đến công viên."),
    ("The train leaves at 8 PM tonight.", "The train leave at 8 PM tonight.", "Present continuous schedule meaning uses simple present", "Chuyến tàu rời đi lúc 8 giờ tối nay."),
    ("Does he always wake up early?", "Do he always wake up early?", "Does vs Do auxiliary in questions", "Anh ấy có luôn thức dậy sớm không?"),
    ("Do you want some ice cream?", "Does you want some ice cream?", "Do vs Does auxiliary in questions", "Bạn có muốn một ít kem không?"),
    ("It snows heavily in winter.", "It snow heavily in winter.", "Third-person singular 's' missing for 'It'", "Tuyết rơi dày vào mùa đông."),
    ("The boys love playing video games.", "The boys loves playing video games.", "Incorrect 's' on plural subject", "Những cậu bé thích chơi trò chơi điện tử."),
    ("Water boils at 100 degrees.", "Water boil at 100 degrees.", "Third-person singular 's' missing for uncountable noun", "Nước sôi ở 100 độ."),
    ("Why does she study so hard?", "Why do she study so hard?", "Does vs Do in WH-questions", "Tại sao cô ấy học chăm chỉ như vậy?")
]
rps_verbs = [
    ("reads a book", "read a book", "đọc sách"),
    ("enjoys the sunshine", "enjoy the sunshine", "tận hưởng ánh nắng"),
    ("makes a cake", "make a cake", "làm một cái bánh")
]
rps_plural = [
    ("walk to work", "walks to work", "đi bộ đi làm"),
    ("listen carefully", "listens carefully", "lắng nghe cẩn thận")
]
for i in range(30):
    if i % 2 == 0:
        sub = random.choice(["He", "She", "The dog"])
        sub_vi = "Anh ấy" if sub == "He" else "Cô ấy" if sub == "She" else "Con chó"
        verb = random.choice(rps_verbs)
        rps_templates.append((f"{sub} {verb[0]}.", f"{sub} {verb[1]}.", "Third person singular 's'", f"{sub_vi} {verb[2]}."))
    else:
        sub = random.choice(["They", "We", "The cats"])
        sub_vi = "Họ" if sub == "They" else "Chúng tôi" if sub == "We" else "Những con mèo"
        verb = random.choice(rps_plural)
        rps_templates.append((f"{sub} {verb[0]}.", f"{sub} {verb[1]}.", "Plural subject no 's'", f"{sub_vi} {verb[2]}."))

fs_templates = [
    ("I will go to the park tomorrow.", "I will goes to the park tomorrow.", "Modal auxiliary 'will' followed by bare infinitive", "Tôi sẽ đi công viên vào ngày mai."),
    ("She will finish her homework soon.", "She will finishing her homework soon.", "Modal auxiliary 'will' followed by bare infinitive", "Cô ấy sẽ hoàn thành bài tập về nhà sớm thôi."),
    ("We are going to travel to Japan next year.", "We is going to travel to Japan next year.", "'Going to' future subject-verb agreement", "Chúng tôi dự định sẽ đi du lịch Nhật Bản vào năm sau."),
    ("They will win the game if they try.", "They will won the game if they try.", "Will + plural past tense error", "Họ sẽ thắng trò chơi nếu họ cố gắng."),
    ("He will call you later tonight.", "He will calls you later tonight.", "Will + third-person singular error", "Anh ấy sẽ gọi cho bạn tối nay."),
    ("It is going to rain this afternoon.", "It are going to rain this afternoon.", "'Going to' future subject-verb agreement with 'it'", "Trời dự định sẽ mưa vào chiều nay."),
    ("The sun will rise at 6 AM.", "The sun will rising at 6 AM.", "Will + continuous participle error", "Mặt trời sẽ mọc lúc 6 giờ sáng."),
    ("I am going to buy a new computer.", "I is going to buy a new computer.", "'Going to' future subject-verb agreement (I am)", "Tôi dự định mua một máy tính mới."),
    ("We will be very happy to see you.", "We will are very happy to see you.", "Will + be vs Will + are", "Chúng tôi sẽ rất vui khi gặp bạn."),
    ("Tom isn't going to play with us.", "Tom aren't going to play with us.", "Negative 'Going to' subject-verb agreement", "Tom sẽ không chơi cùng chúng ta đâu."),
    ("Will you help me with this box?", "Will you helps me with this box?", "Will + bare infinitive in questions", "Bạn sẽ giúp tôi với chiếc hộp này chứ?"),
    ("What will she wear to the party?", "What she will wear to the party?", "WH-question syntax inversion missing", "Cô ấy sẽ mặc gì đến bữa tiệc?"),
    ("My students will write a test on Monday.", "My students will wrote a test on Monday.", "Will + past tense error", "Học sinh của tôi sẽ làm bài kiểm tra vào thứ Hai."),
    ("They are going to build a new bridge here.", "They is going to build a new bridge here.", "Plural subject 'going to' agreement", "Họ dự định xây một cây cầu mới ở đây."),
    ("I won't tell anyone your secret.", "I willn't tell anyone your secret.", "Negative structure of will (won't vs willn't)", "Tôi sẽ không nói cho ai biết bí mật của bạn."),
    ("Where are you going to stay?", "Where is you going to stay?", "WH-question with going-to agreement", "Bạn dự định sẽ ở đâu?"),
    ("She won't be happy about this.", "She don't will be happy about this.", "Double negative / modal auxiliary structure", "Cô ấy sẽ không vui về điều này."),
    ("The dog is going to catch the ball.", "The dog am going to catch the ball.", "'Going to' subject-verb agreement", "Con chó chuẩn bị bắt được quả bóng kìa."),
    ("We will eat pizza for dinner tonight.", "We will eating pizza for dinner tonight.", "Will + continuous participle error", "Chúng tôi sẽ ăn pizza cho bữa tối nay."),
    ("Are they going to join the club?", "Is they going to join the club?", "Question formation with going-to", "Họ có dự định tham gia câu lạc bộ không?")
]
for i in range(30):
    sub = random.choice(["I", "You", "He", "She", "It", "We", "They"])
    sub_vi = {"I": "Tôi", "You": "Bạn", "He": "Anh ấy", "She": "Cô ấy", "It": "Nó", "We": "Chúng tôi", "They": "Họ"}[sub]
    verb = random.choice([("visit the museum", "thăm bảo tàng"), ("draw a picture", "vẽ một bức tranh"), ("clean the house", "lau nhà")])
    if i % 2 == 0:
        fs_templates.append((f"{sub} will {verb[0]}.", f"{sub} will {verb[0].split()[0]}s {' '.join(verb[0].split()[1:])}.", "Will + bare infinitive", f"{sub_vi} sẽ {verb[1]}."))
    else:
        fs_templates.append((f"{sub} will {verb[0]}.", f"{sub} will {verb[0].split()[0]}ed {' '.join(verb[0].split()[1:])}.", "Will + bare infinitive", f"{sub_vi} sẽ {verb[1]}."))

pp_templates = [
    ("She has eaten all her vegetables.", "She have eaten all her vegetables.", "Present perfect auxiliary agreement (has vs have)", "Cô ấy đã ăn hết rau của mình."),
    ("They have visited London three times.", "They has visited London three times.", "Present perfect auxiliary agreement (have vs has)", "Họ đã đến thăm London ba lần."),
    ("I have finished my homework already.", "I has finished my homework already.", "Present perfect auxiliary agreement (have vs has)", "Tôi đã hoàn thành xong bài tập về nhà."),
    ("He has lost his keys again.", "He have lost his keys again.", "Present perfect auxiliary agreement (has vs have)", "Anh ấy lại làm mất chìa khóa."),
    ("We haven't seen that movie yet.", "We hasn't seen that movie yet.", "Negative auxiliary agreement (haven't vs hasn't)", "Chúng tôi chưa xem bộ phim đó."),
    ("My mom has cooked dinner.", "My mom have cooked dinner.", "Present perfect auxiliary agreement (has vs have)", "Mẹ tôi nấu xong bữa tối rồi."),
    ("I have been to Paris before.", "I have went to Paris before.", "Past participle 'been' vs Past simple 'went'", "Tôi đã từng đến Paris trước đây."),
    ("She has broken her arm.", "She has broke her arm.", "Past participle 'broken' vs Past simple 'broke'", "Cô ấy bị gãy tay."),
    ("They have written a new song.", "They have wrote a new song.", "Past participle 'written' vs Past simple 'wrote'", "Họ đã viết xong một bài hát mới."),
    ("Has he ever flown in a helicopter?", "Have he ever flown in a helicopter?", "Question auxiliary agreement (Has vs Have)", "Anh ấy đã từng bay bằng trực thăng chưa?"),
    ("Have you seen my dog?", "Has you seen my dog?", "Question auxiliary agreement (Have vs Has)", "Bạn có thấy con chó của tôi không?"),
    ("The train has just arrived.", "The train have just arrived.", "Present perfect auxiliary agreement for singular noun", "Chuyến tàu vừa mới đến."),
    ("We have painted the whole house.", "We has painted the whole house.", "Present perfect auxiliary agreement (have vs has)", "Chúng tôi đã sơn xong toàn bộ ngôi nhà."),
    ("My sister has taken my jacket.", "My sister has took my jacket.", "Past participle 'taken' vs Past simple 'took'", "Chị gái tôi đã lấy áo khoác của tôi."),
    ("I haven't slept well lately.", "I hasn't slept well lately.", "Negative auxiliary agreement with I", "Gần đây tôi ngủ không ngon giấc."),
    ("They have sung that song twice.", "They have sang that song twice.", "Past participle 'sung' vs Past simple 'sang'", "Họ đã hát bài đó hai lần rồi."),
    ("She hasn't spoken to him today.", "She haven't spoken to him today.", "Negative auxiliary agreement (hasn't vs haven't)", "Hôm nay cô ấy chưa nói chuyện với anh ấy."),
    ("You have grown so much!", "You has grown so much!", "Present perfect auxiliary agreement with You", "Cháu đã lớn quá nhiều rồi!"),
    ("He has forgotten my name.", "He has forgot my name.", "Past participle 'forgotten' vs Past simple 'forgot'", "Anh ấy đã quên tên tôi rồi."),
    ("How long have you lived here?", "How long has you lived here?", "WH-question auxiliary agreement", "Bạn đã sống ở đây bao lâu rồi?")
]
for i in range(30):
    if i % 2 == 0:
        pp_templates.append((f"She has found a new job.", f"She have found a new job.", "has vs have", f"Cô ấy đã tìm được công việc mới."))
    else:
        pp_templates.append((f"We have learned a lot.", f"We has learned a lot.", "have vs has", f"Chúng tôi đã học được rất nhiều."))


sentences_json = []

for idx, (corr, wro, foc, trans) in enumerate(pc_templates):
    level = "Beginner" if idx < 15 else "Intermediate" if idx < 35 else "Advanced"
    sentences_json.append({"id": f"pc{idx+1}", "tense": "Present Continuous", "level": level, "correct_sentence": corr, "wrong_sentence": wro, "pedagogical_focus": foc, "vietnamese_translation": trans})

for idx, (corr, wro, foc, trans) in enumerate(ps_templates):
    level = "Beginner" if idx < 15 else "Intermediate" if idx < 35 else "Advanced"
    sentences_json.append({"id": f"ps{idx+1}", "tense": "Past Simple", "level": level, "correct_sentence": corr, "wrong_sentence": wro, "pedagogical_focus": foc, "vietnamese_translation": trans})

for idx, (corr, wro, foc, trans) in enumerate(rps_templates):
    level = "Beginner" if idx < 15 else "Intermediate" if idx < 35 else "Advanced"
    sentences_json.append({"id": f"rps{idx+1}", "tense": "Present Simple", "level": level, "correct_sentence": corr, "wrong_sentence": wro, "pedagogical_focus": foc, "vietnamese_translation": trans})

for idx, (corr, wro, foc, trans) in enumerate(fs_templates):
    level = "Beginner" if idx < 15 else "Intermediate" if idx < 35 else "Advanced"
    sentences_json.append({"id": f"fs{idx+1}", "tense": "Future Simple", "level": level, "correct_sentence": corr, "wrong_sentence": wro, "pedagogical_focus": foc, "vietnamese_translation": trans})

for idx, (corr, wro, foc, trans) in enumerate(pp_templates):
    level = "Beginner" if idx < 15 else "Intermediate" if idx < 35 else "Advanced"
    sentences_json.append({"id": f"pp{idx+1}", "tense": "Present Perfect", "level": level, "correct_sentence": corr, "wrong_sentence": wro, "pedagogical_focus": foc, "vietnamese_translation": trans})

with open('public/db/tense_sentences_esl.json', 'w', encoding='utf-8') as f:
    json.dump(sentences_json, f, ensure_ascii=False, indent=2)
