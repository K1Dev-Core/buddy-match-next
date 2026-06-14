import { Buddy } from "@/lib/types";

export const buddies: Buddy[] = [
  {
    id: "rin",
    name: "พี่ริน",
    nickname: "Deer Reader",
    image: "/assets/characters/deer.png",
    major: "ครุศาสตร์",
    year: "ปี 3",
    bio: "ใจเย็น ชอบติวก่อนสอบ ชวนคุยเก่งเวลาพูดเรื่องหนังสือกับกิจกรรมชมรม",
    sharedTags: ["Art Lovers", "Morning Coffee", "Reading"],
    hints: ["ชอบดื่มกาแฟส้ม", "ชอบใส่เสื้อฮู้ดสีเทา", "ชอบเดินสวนสัตว์"],
    criteriaTitle: "Matching based on hobbies & comfort energy",
    criteriaItems: ["Reading", "Journaling", "Study Buddy"],
    orbitLogos: [
      { alt: "Python", src: "/assets/logo/python.png" },
      { alt: "C", src: "/assets/logo/c-.png" },
      { alt: "Swift", src: "/assets/logo/swift.png" },
      { alt: "Java", src: "/assets/logo/java.png" }
    ],
    matchPercent: 91,
    answerAliases: ["พี่ริน", "ริน", "rin"],
    greeting:
      "ยินดีที่ได้เป็นพี่รหัสนะ ถ้าอยากคุยเรื่องวิชาเรียนหรือหามุมอ่านหนังสือชิลๆ ทักมาได้เลย เดี๋ยวพาไปรู้จักเพื่อนในชมรมด้วย",
    contactLabel: "Line: @rinbuddy",
    contactHref: "https://line.me/ti/p/@rinbuddy",
    palette: {
      accent: "#8fb677",
      accentSoft: "#e7f5e1",
      outline: "#456731"
    }
  },
  {
    id: "leo",
    name: "พี่ลีโอ",
    nickname: "Leopard Mentor",
    image: "/assets/characters/leopard.png",
    major: "วิศวกรรมคอมพิวเตอร์",
    year: "ปี 4",
    bio: "คุยง่าย พาเดินดูแลบได้ ชอบจับคู่คนที่สนใจโค้ดกับงานดีไซน์เข้าด้วยกัน",
    sharedTags: ["UI Systems", "Campus Walk", "Coding Jam"],
    hints: ["ชอบโค้ดตอนดึก", "พกเป้สีน้ำเงิน", "ชอบชาไทยหวานน้อย"],
    criteriaTitle: "Matching based on major & collaboration style",
    criteriaItems: ["Frontend", "Mentoring", "Hackathon"],
    orbitLogos: [
      { alt: "Python", src: "/assets/logo/python.png" },
      { alt: "Java", src: "/assets/logo/java.png" },
      { alt: "Swift", src: "/assets/logo/swift.png" },
      { alt: "C", src: "/assets/logo/c-.png" }
    ],
    matchPercent: 89,
    answerAliases: ["พี่ลีโอ", "ลีโอ", "leo"],
    greeting:
      "เก่งมากที่ทายถูก ไว้ถ้าอยากดูเส้นทางสายคอม ชมแลบ หรือหา teammate ลงงาน hackathon ทักมาได้เลย",
    contactLabel: "Instagram: @leo.codes.campus",
    contactHref: "https://instagram.com/leo.codes.campus",
    palette: {
      accent: "#fdad5b",
      accentSoft: "#fff0df",
      outline: "#8c5000"
    }
  },
  {
    id: "mori",
    name: "พี่โมริ",
    nickname: "Quiet Guide",
    image: "/assets/characters/deer.png",
    major: "นิเทศศาสตร์",
    year: "ปี 2",
    bio: "ถนัดเรื่องพรีเซนต์และการจัดกิจกรรม ชอบเพื่อนใหม่ที่คุยกันสบายๆ แบบไม่เกร็ง",
    sharedTags: ["Photo Walk", "Storytelling", "Calm Space"],
    hints: ["ชอบถ่ายรูปตอนเย็น", "ติดเข็มกลัดรูปใบไม้", "ฟังเพลง lo-fi ก่อนเรียน"],
    criteriaTitle: "Matching based on vibe & activity rhythm",
    criteriaItems: ["Creative Club", "Photo Talk", "Weekend Cafe"],
    orbitLogos: [
      { alt: "Python", src: "/assets/logo/python.png" },
      { alt: "Java", src: "/assets/logo/java.png" },
      { alt: "Swift", src: "/assets/logo/swift.png" },
      { alt: "C", src: "/assets/logo/c-.png" }
    ],
    matchPercent: 87,
    answerAliases: ["พี่โมริ", "โมริ", "mori"],
    greeting:
      "ยินดีด้วยนะ เราเอง ถ้าช่วงแรกยังเกร็งๆ เรื่องเพื่อนหรือกิจกรรมมหาลัย ทักมาได้เลย เราช่วยแนะนำได้หมดแบบสบายๆ",
    contactLabel: "Discord: mori.campus",
    contactHref: "https://discord.com/users/mori.campus",
    palette: {
      accent: "#c9a296",
      accentSoft: "#fff3ef",
      outline: "#77574d"
    }
  },
  {
    id: "nova",
    name: "พี่โนว่า",
    nickname: "Warm Builder",
    image: "/assets/characters/leopard.png",
    major: "สถาปัตยกรรม",
    year: "ปี 4",
    bio: "ชอบช่วยจัดตารางชีวิตมหาลัยให้ลงตัว ระหว่างงานสตูดิโอกับเวลาพักที่ยังมีแรงเหลือ",
    sharedTags: ["Architecture", "Gaming", "Photography"],
    hints: ["ชอบวาดในไอแพด", "ใส่นาฬิกาหน้าปัดเหลี่ยม", "ชอบนั่งมุมติดหน้าต่าง"],
    criteriaTitle: "Matching based on focus habits & interests",
    criteriaItems: ["Architecture", "Gaming", "Photography"],
    orbitLogos: [
      { alt: "Swift", src: "/assets/logo/swift.png" },
      { alt: "Python", src: "/assets/logo/python.png" },
      { alt: "Java", src: "/assets/logo/java.png" },
      { alt: "C", src: "/assets/logo/c-.png" }
    ],
    matchPercent: 93,
    answerAliases: ["พี่โนว่า", "โนว่า", "nova"],
    greeting:
      "เยี่ยมมาก เดี๋ยวพาแชร์ทริคจัดเวลาเรียนกับเวลาพักให้บาลานซ์ แล้วถ้าอยากคุยเรื่องงานออกแบบหรือโปรเจกต์ก็ทักมาได้เลย",
    contactLabel: "Email: nova.buddy@campus.example",
    contactHref: "mailto:nova.buddy@campus.example",
    palette: {
      accent: "#f6b36f",
      accentSoft: "#fff2e3",
      outline: "#9c5a10"
    }
  }
];
