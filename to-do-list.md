## To-Do List: AI Reel Maker Implementation Plan

### Phase 1: Core Export Functionality with ReVideo.js (Iteration 1)

#### Task 1.1: Implement Video Export/Download Functionality with ReVideo.js - High Priority

- [ ] **1.1.1 ReVideo.js Integration:**
    - [ ] Research ReVideo.js library and its capabilities.
    - [ ] Install ReVideo.js package in the frontend project.
    - [ ] Set up basic ReVideo.js environment in `app/projects/[id]/preview/page.tsx`.
    - [ ] Understand ReVideo.js API for video composition, audio, and text overlays.

- [ ] **1.1.2 Modify `app/projects/[id]/preview/page.tsx` for ReVideo.js Usage:**
    - [ ] **Fetch Data:**
        - [ ] Fetch mock video URLs (`project.mediaUrls`).
        - [ ] Fetch audio URL (`project.audioUrl`).
        - [ ] Fetch subtitle data (`project.subtitles`).
    - [ ] **ReVideo.js Composition:**
        - [ ] Create a video timeline in ReVideo.js using mock video URLs.
        - [ ] Implement scene durations (if available in mock data or simulated).
        - [ ] Add audio track to ReVideo.js composition and synchronize.
        - [ ] *(Initial Scope: Defer subtitle integration for now)*

- [ ] **1.1.3 "Download" Button Logic:**
    - [ ] Implement frontend logic to trigger ReVideo.js composition on "Download" button click in `app/projects/[id]/preview/page.tsx`.

- [ ] **1.1.4 MP4 Export & Download:**
    - [ ] Configure ReVideo.js to export the composed video as an MP4 file.
    - [ ] Implement browser download initiation for the exported MP4 video.

- [ ] **1.1.5 Testing: Video Download & Playback:**
    - [ ] Test video download functionality in Chrome browser.
    - [ ] Test video download functionality in Firefox browser.
    - [ ] Test video download functionality in Safari browser.
    - [ ] Verify that downloaded video plays correctly with audio.
    - [ ] Verify basic ReVideo.js integration functionality.

#### Task 1.2: Refine Mock Video Generation & Scene Handling for Export - Medium Priority

- [ ] **1.2.1 Modify Mock Video URL Generation:**
    - [ ] Update mock video URL generation in `lib/project-service.ts` (and API routes if needed).
    - [ ] Generate mock video URLs corresponding to script scenes.
    - [ ] Simulate scene durations in mock video data.
    - [ ] *(Optional for Iteration 1: Simulate basic transitions between mock clips)*

- [ ] **1.2.2 Ensure `scenes` Data Structure for Export:**
    - [ ] Verify that the `scenes` data in `project` data includes scene durations or simulation-ready info.
    - [ ] Ensure data structure is accessible and usable in `app/projects/[id]/preview/page.tsx` for ReVideo.js.

- [ ] **1.2.3 Testing: Mock Data Structure for ReVideo.js:**
    - [ ] Test and verify that the mock video data and scene information is correctly structured.
    - [ ] Ensure ReVideo.js can consume and utilize the mock data for video assembly.

#### Task 1.3: Basic Error Handling for Video Export - Low Priority

- [ ] **1.3.1 Add Error Handling in `app/projects/[id]/preview/page.tsx`:**
    - [ ] Implement basic error handling for ReVideo.js composition and export processes.
    - [ ] Catch potential errors from ReVideo.js library.
    - [ ] Catch potential browser-related download failures.

- [ ] **1.3.2 Display Error Messages:**
    - [ ] Display simple user-facing error messages in `app/projects/[id]/preview/page.tsx` if video export fails (e.g., using `alert()` or a simple UI notification).

- [ ] **1.3.3 Testing: Error Scenario Simulation:**
    - [ ] Simulate errors by intentionally breaking ReVideo.js integration or mimicking network issues during download.
    - [ ] Verify that basic error messages are displayed to the user in error scenarios.

### Phase 2: Timeline Refinement & Subtitle Integration (Iteration 2) - *(To be planned in detail after Phase 1)*

#### Task 2.1: Refine Timeline Component for Enhanced User Control - Medium Priority *(Adjust based on Phase 1 progress)*
    - *(Detailed to-dos will be added based on feedback and Phase 1 outcomes)*

#### Task 2.2: Integrate Subtitles into Video Export with ReVideo.js - Medium Priority *(If deferred from Phase 1)*
    - [ ] **2.2.1 Explore ReVideo.js Subtitle Capabilities:**
        - [ ] Research ReVideo.js documentation and examples for text overlay/subtitle rendering.
        - [ ] Understand synchronization methods for subtitles with video and audio.

    - [ ] **2.2.2 Update `app/projects/[id]/preview/page.tsx` for Subtitle Integration:**
        - [ ] Fetch subtitle data (`project.subtitles`).
        - [ ] Use ReVideo.js API to render subtitles on the video composition.
        - [ ] Synchronize subtitle display with the audio track and scene timings.

    - [ ] **2.2.3 Testing: Video Export with Subtitles:**
        - [ ] Test video export functionality with subtitles enabled.
        - [ ] Verify subtitles are correctly rendered in the downloaded video.
        - [ ] Verify subtitle timing and synchronization with audio.

### Phase 3: *(Future Iterations - Deprioritized for now)*
    - *(No to-dos for Phase 3 in this plan)*

---
**Legend:**
- [ ] - To do
- [X] - Completed (Use [X] to mark tasks as done as you progress)