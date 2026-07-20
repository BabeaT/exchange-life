import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BrandPage, StartPage, AuthPage, ProfilePage, JoinPage } from './legacy-pages/EntryPages'
import { ExchangeSpacePage, LettersPage } from './legacy-pages/HomePages'
import { CreateExchangePage, EventContextPage, ThemeContextPage, CreateReviewPage, InvitePage, ContextReadPage } from './legacy-pages/CreatePages'
import { WritePage, OrganizePage, ComposePage, PreviewPage, SendSettingsPage, WaitingPage } from './legacy-pages/StoryPages'
import { DeliveryPage, ReadLetterPage, ReactionPage, ReplyChoicePage, IntersectionPage } from './legacy-pages/LetterPages'
import { MemoryFragmentPage, MemoryTreePage } from './legacy-pages/MemoryPages'
import { PersonalSpacePage, SettingsPage } from './legacy-pages/AccountPages'
import { DemoControlPage, DevStyleLabPage, SystemStatePage } from './legacy-pages/DemoPages'
import { StyleLabPage } from './legacy-pages/PersonalizationPages'

export default function App() {
  return <Routes>
    <Route path="/" element={<BrandPage />} />
    <Route path="/start" element={<StartPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/join" element={<JoinPage />} />
    <Route path="/demo-control" element={<DemoControlPage />} />
    <Route element={<AppShell />}>
      <Route path="/home" element={<Navigate to="/letters" replace />} />
      <Route path="/exchanges/new" element={<CreateExchangePage />} />
      <Route path="/exchanges/new/event" element={<EventContextPage />} />
      <Route path="/exchanges/new/theme" element={<ThemeContextPage />} />
      <Route path="/exchanges/new/review" element={<CreateReviewPage />} />
      <Route path="/exchanges/:exchangeId/invite" element={<InvitePage />} />
      <Route path="/exchanges/:exchangeId/context" element={<ContextReadPage />} />
      <Route path="/exchanges/:exchangeId" element={<ExchangeSpacePage />} />
      <Route path="/exchanges/:exchangeId/write" element={<WritePage />} />
      <Route path="/exchanges/:exchangeId/organize" element={<OrganizePage />} />
      <Route path="/exchanges/:exchangeId/compose" element={<ComposePage />} />
      <Route path="/exchanges/:exchangeId/preview" element={<PreviewPage />} />
      <Route path="/exchanges/:exchangeId/send" element={<SendSettingsPage />} />
      <Route path="/exchanges/:exchangeId/waiting" element={<WaitingPage />} />
      <Route path="/exchanges/:exchangeId/delivery/:letterId" element={<DeliveryPage />} />
      <Route path="/exchanges/:exchangeId/letters/:letterId" element={<ReadLetterPage />} />
      <Route path="/exchanges/:exchangeId/letters/:letterId/respond" element={<ReactionPage />} />
      <Route path="/exchanges/:exchangeId/reply-choice/:letterId" element={<ReplyChoicePage />} />
      <Route path="/exchanges/:exchangeId/convergence" element={<IntersectionPage />} />
      <Route path="/exchanges/:exchangeId/memory" element={<MemoryFragmentPage />} />
      <Route path="/letters" element={<LettersPage />} />
      <Route path="/memory-tree" element={<MemoryTreePage />} />
      <Route path="/space" element={<PersonalSpacePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/messenger" element={<Navigate to="/style-lab" replace />} />
      <Route path="/style-lab" element={<StyleLabPage />} />
      <Route path="/dev/style-lab" element={<DevStyleLabPage />} />
      <Route path="/status/loading" element={<SystemStatePage type="loading" />} />
      <Route path="/status/network" element={<SystemStatePage type="network" />} />
      <Route path="/forbidden" element={<SystemStatePage type="forbidden" />} />
      <Route path="/404" element={<SystemStatePage type="not-found" />} />
    </Route>
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
}
