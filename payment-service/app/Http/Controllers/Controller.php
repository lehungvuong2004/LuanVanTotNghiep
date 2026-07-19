<?php

namespace App\Http\Controllers;

use App\Traits\HasApiResponse;
use App\Traits\HasRoleAuthorization;

abstract class Controller
{
    use HasApiResponse, HasRoleAuthorization;
}
