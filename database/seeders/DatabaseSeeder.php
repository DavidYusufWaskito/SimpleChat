<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory(10)->create([
        //     'name' => fake()->name(),
        //     'email' => fake()->unique()->safeEmail(),
        //     'password' => bcrypt('password'),
        // ]);
        \App\Models\User::factory(5)->create()->each(function ($user) {
            $user->name = fake()->name();
            $user->email = fake()->unique()->safeEmail();
            $user->password = bcrypt('password');
        });
        
    }
}
