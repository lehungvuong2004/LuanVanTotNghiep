<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotKnowledge extends Model
{
    use HasFactory;

    protected $table = 'chatbot_knowledges';

    protected $fillable = [
        'keyword',
        'question',
        'content',
    ];
}
