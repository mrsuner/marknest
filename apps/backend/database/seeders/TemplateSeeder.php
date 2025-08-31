<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create public system templates
        $systemTemplates = [
            [
                'name' => 'Meeting Notes',
                'category' => 'business',
                'content' => "# Meeting Notes - {{date}}\n\n**Attendees:** {{attendees}}\n**Duration:** {{duration}}\n**Location:** {{location}}\n\n## Agenda\n1. {{agenda_item_1}}\n2. {{agenda_item_2}}\n3. {{agenda_item_3}}\n\n## Discussion Points\n\n{{discussion}}\n\n## Action Items\n- [ ] {{action_1}}\n- [ ] {{action_2}}\n- [ ] {{action_3}}\n\n## Next Meeting\n**Date:** {{next_meeting_date}}\n**Topics:** {{next_topics}}",
                'is_public' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Project Proposal',
                'category' => 'business',
                'content' => "# {{project_title}}\n\n**Prepared by:** {{author}}\n**Date:** {{date}}\n**Version:** {{version}}\n\n## Executive Summary\n\n{{summary}}\n\n## Project Overview\n\n### Objectives\n- {{objective_1}}\n- {{objective_2}}\n- {{objective_3}}\n\n### Scope\n{{scope}}\n\n## Timeline\n\n| Phase | Duration | Deliverables |\n|-------|----------|-------------|\n| Phase 1 | {{phase1_duration}} | {{phase1_deliverables}} |\n| Phase 2 | {{phase2_duration}} | {{phase2_deliverables}} |\n| Phase 3 | {{phase3_duration}} | {{phase3_deliverables}} |\n\n## Budget\n\n**Total Cost:** {{total_cost}}\n\n## Risk Assessment\n\n{{risks}}\n\n## Conclusion\n\n{{conclusion}}",
                'is_public' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Research Paper',
                'category' => 'academic',
                'content' => "# {{title}}\n\n**Author:** {{author}}\n**Institution:** {{institution}}\n**Date:** {{date}}\n\n## Abstract\n\n{{abstract}}\n\n**Keywords:** {{keywords}}\n\n## 1. Introduction\n\n{{introduction}}\n\n## 2. Literature Review\n\n{{literature_review}}\n\n## 3. Methodology\n\n{{methodology}}\n\n## 4. Results\n\n{{results}}\n\n## 5. Discussion\n\n{{discussion}}\n\n## 6. Conclusion\n\n{{conclusion}}\n\n## References\n\n{{references}}",
                'is_public' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'API Documentation',
                'category' => 'technical',
                'content' => "# {{api_name}} API Documentation\n\n**Version:** {{version}}\n**Base URL:** {{base_url}}\n**Last Updated:** {{date}}\n\n## Overview\n\n{{overview}}\n\n## Authentication\n\n{{authentication}}\n\n## Endpoints\n\n### GET {{endpoint_1}}\n\n**Description:** {{endpoint_1_description}}\n\n**Parameters:**\n- `{{param_1}}` ({{param_1_type}}): {{param_1_description}}\n- `{{param_2}}` ({{param_2_type}}): {{param_2_description}}\n\n**Response:**\n```json\n{{response_example}}\n```\n\n### POST {{endpoint_2}}\n\n**Description:** {{endpoint_2_description}}\n\n**Request Body:**\n```json\n{{request_example}}\n```\n\n**Response:**\n```json\n{{response_example_2}}\n```\n\n## Error Codes\n\n| Code | Description |\n|------|-------------|\n| 400 | Bad Request |\n| 401 | Unauthorized |\n| 403 | Forbidden |\n| 404 | Not Found |\n| 500 | Internal Server Error |",
                'is_public' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Personal Journal',
                'category' => 'personal',
                'content' => "# Journal Entry - {{date}}\n\n**Mood:** {{mood}}\n**Weather:** {{weather}}\n\n## Today's Highlights\n\n{{highlights}}\n\n## Thoughts & Reflections\n\n{{thoughts}}\n\n## Gratitude\n\n- {{gratitude_1}}\n- {{gratitude_2}}\n- {{gratitude_3}}\n\n## Tomorrow's Goals\n\n- [ ] {{goal_1}}\n- [ ] {{goal_2}}\n- [ ] {{goal_3}}\n\n## Quote of the Day\n\n> {{quote}}",
                'is_public' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($systemTemplates as $template) {
            Template::factory()->create(array_merge($template, [
                'user_id' => null,
                'usage_count' => rand(50, 500),
            ]));
        }

        // Create user-specific templates
        User::all()->each(function ($user) {
            if (rand(1, 100) <= 50) { // 50% chance
                Template::factory(rand(1, 3))->create([
                    'user_id' => $user->id,
                    'is_public' => rand(1, 100) <= 20, // 20% chance to make public
                ]);
            }
        });

        // Create some popular public templates from users
        $activeUsers = User::whereIn('plan', ['pro', 'enterprise'])->get();
        $activeUsers->each(function ($user) {
            if (rand(1, 100) <= 30) { // 30% chance
                Template::factory()->public()->create([
                    'user_id' => $user->id,
                    'usage_count' => rand(100, 1000),
                ]);
            }
        });
    }
}