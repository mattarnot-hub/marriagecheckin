// Static content drawn from the therapy goals (Susan Netterfield, Sept 14 2026)
// and the Gottman Relationship Checkup (May 13 2025). Edit freely after each goal review.

export const GOALS = [
  {
    id: 'g1',
    title: 'Reduce negative affect during conflict',
    area: 'Checkup challenges: Harsh Startup, Flooding, Accepting Influence, Compromise',
    practices: [
      { id: 'g1-gentle', priority: 1, text: 'Use the Gentle Start-Up when expressing a need', tool: 'startup' },
      { id: 'g1-stonewall', priority: 1, text: 'Block stonewalling; use the antidote: self-soothing', tool: 'flooding' },
      { id: 'g1-flood', priority: 2, text: 'Manage flooding: call a 20-minute break and come back', tool: 'flooding' },
      { id: 'g1-safety', text: 'Establish emotional safety; express needs to be heard (chores)', tool: 'safety' },
      { id: 'g1-aftermath', text: 'Process a past hurt (Aftermath of a Fight, Adderall)', tool: 'aftermath' },
      { id: 'g1-gridlock', text: 'Dialogue about a gridlocked issue: money, raising children / school', tool: 'parking' },
      { id: 'g1-compromise', text: 'Practice compromise (2-oval)', tool: 'compromise' },
      { id: 'g1-betrayal', text: 'Betrayal repair: Atone, Attune, Attach', tool: 'betrayal' },
    ],
  },
  {
    id: 'g2',
    title: 'Increase positive affect during conflict',
    area: 'Checkup challenges: Repair Attempts, Accepting Influence',
    practices: [
      { id: 'g2-ratio', text: 'Keep the 5:1 positive-to-negative ratio during conflict', tool: 'ratio' },
      { id: 'g2-repair', text: 'Recognize and accept each other’s repair attempts', tool: 'repair' },
      { id: 'g2-meta', text: 'Bridge meta-emotional mismatch: history, feelings and needs', tool: 'meta' },
      { id: 'g2-stress', text: 'Have a stress-reducing conversation', tool: 'stress' },
    ],
  },
  {
    id: 'g3',
    title: 'Increase positive experience outside of conflict',
    area: 'Checkup challenge: Turning Toward Bids',
    practices: [
      { id: 'g3-bids', priority: 2, text: 'Turn toward bids for connection and celebrate them (bids exercise)', tool: 'bids' },
      { id: 'g3-sotu', text: 'Hold the weekly State of the Union', tool: 'sotu' },
      { id: 'g3-date', text: 'Plan a date night or use the Gottman card decks (sex and romance)', tool: 'dates' },
      { id: 'g3-ritual', text: 'Nurture a ritual of connection', tool: 'rituals' },
    ],
  },
];

export const STRENGTHS = ['Love Maps', 'Fondness & Admiration', 'Trust', 'Commitment', 'Careful, respectful conflict style'];
export const CHALLENGES = ['Turning Toward Bids', 'Harsh Startup', 'Flooding', 'Accepting Influence', 'Compromise', 'Repair Attempts'];

export const SOTU = [
  { t: 'Appreciations', min: 5, p: 'Each of you shares 3 specific things you appreciated about the other this week. The listener just says "thank you".' },
  { t: 'What went well', min: 5, p: 'Name moments you turned toward each other, and celebrate them. Which bids did you notice?' },
  { t: 'Check the ratio', min: 3, p: 'Any conflicts this week? Did you use a Gentle Start-Up? Did anyone flood, and did you take the break?' },
  { t: 'One issue', min: 15, p: 'Pick ONE issue. Speaker uses a Gentle Start-Up (I feel __ about __, I need __). Listener summarizes back and finds what makes sense (accepting influence). Then swap.' },
  { t: 'Repair', min: 3, p: 'Anything left unrepaired? Offer a repair: "I’m sorry I..." or "What I need right now is..."' },
  { t: 'End on a positive', min: 3, p: 'Choose one ritual or date to look forward to this week, and put it on the calendar.' },
];

export const TOOLS = {
  startup: {
    title: 'Gentle Start-Up',
    blurb: 'Conflicts end the way they begin. Start soft: describe, do not blame.',
    builder: true,
    points: ['Start with "I", not "you"', 'Describe the situation without judging', 'State a clear, positive need', 'Add appreciation or take partial responsibility: "I know I’m partly to blame here"'],
  },
  flooding: {
    title: 'Flooding & self-soothing',
    blurb: 'Flooding is physiological, not emotional. When your heart rate is above roughly 100 bpm you cannot take in your partner’s view.',
    points: [
      'Say the agreed signal or phrase: "I’m flooded, I need a break, and I will come back."',
      'Take at least 20 minutes (the body needs it), no longer than 24 hours.',
      'Do not rehearse the fight or plan rebuttals during the break.',
      'Self-soothe: slow breathing (exhale longer than inhale), a walk, music, a body scan, progressive muscle relaxation.',
      'The person who called the break restarts the conversation. That is the promise that keeps it safe.',
      'Stonewalling antidote: silence WITH a signal, not silence as withdrawal.',
    ],
  },
  safety: {
    title: 'Emotional safety & being heard',
    blurb: 'Rapoport-style structured dialogue, used for needs like chores.',
    points: ['Speaker shares in short chunks about ONE topic.', 'Listener paraphrases: "What I hear you saying is..."', 'Listener asks "Did I get it? Is there more?"', 'Listener validates: "That makes sense because..."', 'Only then switch roles.'],
  },
  aftermath: {
    title: 'Aftermath of a Fight',
    blurb: 'Process a past hurt (for example, around Adderall) without re-fighting it.',
    points: ['Each of you describes what you felt, without blaming.', 'Each shares your subjective reality: how the event looked from your side.', 'Each names what triggered you, and what past experience it touched.', 'Take responsibility for your part, even a small one.', 'Agree on one thing you will each do differently next time.'],
  },
  compromise: {
    title: 'Two-oval compromise',
    blurb: 'Draw two ovals: an inner one for your non-negotiables, an outer one for what you can flex on.',
    points: ['Each person draws both ovals on the issue (inner = core needs and why, outer = flexible).', 'Share your inner oval first. Ask about the story behind it.', 'Find the overlap of the outer ovals.', 'Agree on a trial solution for a set period, then revisit.', 'Compromise is not giving in. It is building a bridge that holds part of both of you.'],
  },
  betrayal: {
    title: 'Atone, Attune, Attach',
    blurb: 'The Gottman betrayal-repair sequence.',
    points: ['ATONE: the betrayer takes full responsibility, shows remorse, answers questions honestly, no defensiveness.', 'ATTUNE: both partners tune in to the hurt and the underlying needs, with empathy.', 'ATTACH: rebuild intimacy and trust through small, consistent, reliable actions and rituals.', 'This is best done with your therapist alongside.'],
  },
  ratio: {
    title: 'The 5:1 ratio',
    blurb: 'Stable couples keep about five positive interactions for every negative one during conflict.',
    points: ['Positives: humor, affection, interest, empathy, "good point", a touch, a smile.', 'Notice yours in the moment. Add one when you catch a negative.', 'Track it in the weekly check-in.'],
  },
  repair: {
    title: 'Repair attempts',
    blurb: 'Saying "sorry" is hard. Use a phrase you both agree on beforehand.',
    phrases: ['I’m sorry, let me try again.', 'Can we start over?', 'I can see your point.', 'I’m getting flooded, can we pause?', 'That came out wrong. What I meant was...', 'I need to feel closer right now.', 'Let’s take a break and come back.', 'I know this is not your fault.', 'Can you say that more gently?', 'Thank you for hearing me.'],
    points: ['A repair attempt only works if it is ACCEPTED. When your partner tries one, take it, even if you are still upset.'],
  },
  meta: {
    title: 'Meta-emotion interview',
    blurb: 'Bridge the mismatch by understanding how each of you learned about feelings.',
    questions: ['How did your family show anger? Sadness? Fear?', 'What happened when you cried as a child?', 'What did you learn about how to handle emotions?', 'How do you feel about your own anger? Sadness?', 'How do you feel when I am angry or sad?', 'What do you need from me when you are upset?'],
    points: ['Use the feelings wheel to find a more exact word: mad, sad, glad, scared, ashamed, surprised, then narrow it down (e.g. sad, then lonely, then abandoned).'],
  },
  stress: {
    title: 'Stress-reducing conversation',
    blurb: 'Talk about stress OUTSIDE the relationship, daily, about 20 minutes each.',
    points: ['Take turns (about 20 min each).', 'The listener is on the talker’s side. No advice unless asked.', 'Show genuine interest: ask questions, "Tell me more".', 'Take your partner’s side, even if you think they are wrong.', 'Express "we against others" and show empathy.', 'Validate emotions: "That sounds so frustrating."'],
  },
  bids: {
    title: 'Bids for connection',
    blurb: 'A bid is any attempt for attention, affection or support. Turn toward, and celebrate.',
    points: ['Turning toward = respond with interest, even briefly.', 'Turning away = ignore. Turning against = dismiss or attack.', 'Couples who stay together turn toward about 86% of the time.', 'Exercise: notice 3 bids a day. Respond to each. Say out loud the small ones ("Look at that bird!").', 'Log counts in the weekly check-in.'],
  },
  dates: {
    title: 'Date nights & romance',
    blurb: 'Ideas for the Gottman card decks and beyond.',
    ideas: ['Cook something new together', 'Recreate your first date', 'Walk with no phones', 'Try a new place in the city', 'A card-deck evening: take turns drawing a Gottman card and answering', 'Watch a film, then share your favourite scene', 'Plan a dream trip together (no budget limits)', 'Give each other a massage', 'Write and swap love notes', 'Sex and intimacy: share one thing you want more of, one you’re curious about'],
  },
  rituals: {
    title: 'Rituals of connection',
    blurb: 'Small, reliable moments that make time together special.',
    ideas: ['A 6-second kiss goodbye and hello', 'Morning coffee together, no phones', 'Ask "How was your day?" and listen for 5 minutes', 'Weekly State of the Union', 'A goodnight phrase', 'Sunday dinner', 'Yearly anniversary review', 'Celebrating small wins'],
  },
  lovemaps: {
    title: 'Love Map questions',
    blurb: 'Update your map of each other’s inner world. Both of you are already strong here, so keep it fresh.',
    questions: ['What is your biggest worry right now?', 'What is something you are looking forward to?', 'Who is someone you’ve been thinking about lately, and why?', 'What is a favorite memory of us?', 'What is one dream you have not told me?', 'What would your ideal Sunday look like?', 'What is stressing you at work or home?', 'What is one thing I do that makes you feel loved?', 'What would you like our life to look like in 5 years?', 'What is something you are proud of from this month?'],
  },
  parking: {
    title: 'Gridlocked issues (Dreams within Conflict)',
    blurb: 'About 69% of couple problems are perpetual. The aim is dialogue, not a solution. Use the Parking Lot page.',
    points: ['Each of you asks about the DREAM under your partner’s position.', 'Do not solve. Understand and honor the dream.', 'Then find a temporary compromise.'],
  },
};

export const FEELINGS = [
  ['Mad', 'frustrated, resentful, hurt, disrespected, irritated'],
  ['Sad', 'lonely, disappointed, ashamed, abandoned, tired'],
  ['Scared', 'anxious, overwhelmed, insecure, helpless, worried'],
  ['Glad', 'grateful, proud, connected, hopeful, relieved'],
];
